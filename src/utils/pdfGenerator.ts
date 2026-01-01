import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, DashboardStats } from '../types';
import bidiFactory from 'bidi-js';
import * as Reshaper from 'arabic-persian-reshaper';

export class PDFReportGenerator {
  private doc: jsPDF;
  private static arabicFontsLoaded = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static bidi: any | null = null;

  constructor() {
    this.doc = new jsPDF();
  }

  private isArabicText(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  private shapeArabic(text: string): string {
    // Convert Arabic letters to presentation forms (connected glyphs) + reorder for visual display.
    // This fixes "disconnected letters" and wrong RTL ordering in many PDF renderers.
    try {
      if (!this.isArabicText(text)) return text;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shaper: any = (Reshaper as any).ArabicShaper;
      const shaped = shaper?.convertArabic ? shaper.convertArabic(text) : text;
      if (!PDFReportGenerator.bidi) {
        // bidi-js default export is a factory function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PDFReportGenerator.bidi = (bidiFactory as any)();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bidi: any = PDFReportGenerator.bidi;
      return typeof bidi?.getReorderedString === 'function' ? bidi.getReorderedString(shaped) : shaped;
    } catch {
      return text;
    }
  }

  private sanitizeFilenamePart(value: string): string {
    return value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-') // Windows forbidden chars
      .replace(/\s+/g, ' ')
      .substring(0, 80);
  }

  private getStatusStyle(status: Patient['status']) {
    const base = { bg: [108, 117, 125] as [number, number, number], text: 'white' as const };
    switch (status) {
      case 'Diagnosed':
        return { bg: [0, 123, 255] as [number, number, number], text: 'white' as const };
      case 'Pre-op':
        return { bg: [255, 193, 7] as [number, number, number], text: 'black' as const };
      case 'Op':
        return { bg: [220, 53, 69] as [number, number, number], text: 'white' as const };
      case 'Post-op':
        return { bg: [40, 167, 69] as [number, number, number], text: 'white' as const };
      default:
        return base;
    }
  }

  private addHeader(title: string, subtitle?: string) {
    // Clinic Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SurgiCare Clinic', 20, 30);
    
    // Report Title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 45);
    
    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, 20, 55);
    }
    
    // Date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65);
    
    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 70, 190, 70);
  }

  private addFooter(pageNumber: number) {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Page ${pageNumber}`, 20, pageHeight - 10);
    this.doc.text('SurgiCare Clinic - Confidential', 120, pageHeight - 10);
  }

  private addTable(data: string[][], headers: string[], startY: number = 80) {
    const pageWidth = this.doc.internal.pageSize.width;
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    const colWidth = tableWidth / headers.length;
    
    let currentY = startY;
    
    // Add headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFillColor(20, 184, 166);
    this.doc.rect(margin, currentY - 5, tableWidth, 12, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    headers.forEach((header, index) => {
      this.doc.text(header, margin + (index * colWidth) + 2, currentY);
    });
    
    currentY += 12; // Increased spacing
    
    // Add data rows
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    data.forEach((row, rowIndex) => {
      if (currentY > this.doc.internal.pageSize.height - 30) {
        this.doc.addPage();
        currentY = 20;
      }
      
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(margin, currentY - 5, tableWidth, 12, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        const cellText = cell.length > 20 ? cell.substring(0, 17) + '...' : cell;
        this.doc.text(cellText, margin + (colIndex * colWidth) + 2, currentY);
      });
      
      currentY += 12; // Increased spacing from 10 to 12
    });
    
    return currentY;
  }

  private async loadAssetAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading asset:', error);
      return '';
    }
  }

  private async ensureArabicFontsLoaded(): Promise<void> {
    if (PDFReportGenerator.arabicFontsLoaded) return;

    const regularDataUrl = await this.loadAssetAsBase64('/fonts/Cairo-Regular.ttf');
    const boldDataUrl = await this.loadAssetAsBase64('/fonts/Cairo-Bold.ttf');

    const regularBase64 = regularDataUrl.split(',')[1] || '';
    const boldBase64 = boldDataUrl.split(',')[1] || '';

    if (!regularBase64 || !boldBase64) {
      console.warn('Arabic fonts not loaded; Arabic text may not render correctly.');
      return;
    }

    // Register font with jsPDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docAny = this.doc as any;
    docAny.addFileToVFS('Cairo-Regular.ttf', regularBase64);
    docAny.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
    docAny.addFileToVFS('Cairo-Bold.ttf', boldBase64);
    docAny.addFont('Cairo-Bold.ttf', 'Cairo', 'bold');

    PDFReportGenerator.arabicFontsLoaded = true;
  }

  generatePatientReport(patients: Patient[], title: string = 'Patient Records Report') {
    this.addHeader(title, `Total Patients: ${patients.length}`);
    
    // Prepare simplified table data: Code, Name, Gender (M/F), Age, Diagnosis
    const tableData = patients.map(patient => {
      const genderShort =
        patient.gender === 'Male' ? 'M' :
        patient.gender === 'Female' ? 'F' :
        'O';

      return [
        patient.code,
        patient.fullNameArabic || 'No Name',
        genderShort,
        String(patient.age),
        patient.diagnosis,
      ];
    });

    const headers = ['Code', 'Name (Arabic)', 'Gender', 'Age', 'Diagnosis'];
    this.addTable(tableData, headers);
    
    // Add footer
    this.addFooter(1);
    
    return this.doc;
  }

  generateStatisticsReport(stats: DashboardStats, title: string = 'Hospital Statistics Report') {
    this.addHeader(title, 'Comprehensive Analytics Report');
    
    let currentY = 80;
    
    // Summary Statistics
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary Statistics', 20, currentY);
    currentY += 20;
    
    const summaryData = [
      ['Total Patients', stats.totalPatients.toString()],
      ['Diagnosed Patients', stats.diagnosedPatients.toString()],
      ['Pre-op Patients', stats.preOpPatients.toString()],
      ['Post-op Patients', stats.postOpPatients.toString()],
    ];
    
    currentY = this.addTable(summaryData, ['Metric', 'Count'], currentY) + 20;
    
    // Diagnosis Distribution
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Diagnosis Distribution', 20, currentY);
    currentY += 20;
    
    const diagnosisData = Object.entries(stats.patientsByDiagnosis).map(([diagnosis, count]) => [
      diagnosis,
      count.toString(),
      `${Math.round((count / stats.totalPatients) * 100)}%`
    ]);
    
    currentY = this.addTable(diagnosisData, ['Diagnosis', 'Count', 'Percentage'], currentY) + 20;
    
    // Monthly Admissions
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Monthly Admissions', 20, currentY);
    currentY += 20;
    
    const monthlyData = Object.entries(stats.monthlyVisits).map(([month, count]) => [
      month,
      count.toString()
    ]);
    
    this.addTable(monthlyData, ['Month', 'Admissions'], currentY);
    
    // Add footer
    this.addFooter(1);
    
    return this.doc;
  }

  generateDashboardReport(patients: Patient[], stats: DashboardStats, title: string = 'Hospital Dashboard Report') {
    this.addHeader(title, 'Complete Hospital Overview');
    
    let currentY = 80;
    
    // Key Metrics
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Performance Indicators', 20, currentY);
    currentY += 20;
    
    const kpiData = [
      ['Total Patients', stats.totalPatients.toString()],
      ['Diagnosed Cases', stats.diagnosedPatients.toString()],
      ['Pre-op Rate', `${Math.round((stats.preOpPatients / stats.totalPatients) * 100)}%`],
      ['Average Age', this.calculateAverageAge(patients).toString()],
    ];
    
    currentY = this.addTable(kpiData, ['Metric', 'Value'], currentY) + 20;
    
    // Recent Patients
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Patients (Last 10)', 20, currentY);
    currentY += 20;
    
    const recentPatients = patients
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    const recentData = recentPatients.map(patient => [
      patient.code,
      patient.fullNameArabic || 'No Name',
      patient.diagnosis,
      new Date(patient.visitedDate || (patient as any).admissionDate).toLocaleDateString(),
      patient.status
    ]);
    
    this.addTable(recentData, ['Code', 'Name', 'Diagnosis', 'Admission Date', 'Status'], currentY);
    
    // Add footer
    this.addFooter(1);
    
    return this.doc;
  }

  private calculateAverageAge(patients: Patient[]): number {
    if (patients.length === 0) return 0;
    const totalAge = patients.reduce((sum, patient) => sum + patient.age, 0);
    return Math.round(totalAge / patients.length);
  }

  download(filename: string = 'hospital-report.pdf') {
    this.doc.save(filename);
  }

  // Helper function to load image from URL and convert to base64
  private async loadImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  }

  // Helper function to create rounded/circular image using canvas (high resolution)
  private async createRoundedImage(imageBase64: string, outputSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Use high resolution canvas (4x) for better quality, then scale down
        const canvasSize = outputSize * 4; // High resolution
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the image at high resolution
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

        // Add border circle
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#17a2b8';
        ctx.lineWidth = 12; // Thicker border for high res
        ctx.stroke();

        // Convert to high quality PNG
        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = reject;
      img.src = imageBase64;
    });
  }

  // Generate a modern, friendly single patient PDF
  async generateSinglePatientPDF(patient: Patient, t: (key: string) => string): Promise<void> {
    await this.ensureArabicFontsLoaded();

    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    const margin = 20;
    let currentY = 25;

    // Load logo - try multiple possible paths
    let logoBase64 = '';
    const logoPaths = ['/imgs/logo.jpg', '/public/imgs/logo.jpg', './imgs/logo.jpg'];
    for (const logoPath of logoPaths) {
      try {
        const logoResponse = await fetch(logoPath);
        if (logoResponse.ok) {
          logoBase64 = await this.loadImageAsBase64(logoPath);
          if (logoBase64) break; // Success, stop trying other paths
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Match website palette (App.css)
    const primaryBlue = [23, 162, 184] as [number, number, number]; // --primary-blue (#17a2b8)
    // const primaryDark = [19, 132, 150] as [number, number, number]; // --primary-dark (#138496)
    const dark = [52, 58, 64] as [number, number, number]; // --dark (#343a40)
    const light = [248, 249, 250] as [number, number, number]; // --light (#f8f9fa)
    const lightGray = [233, 236, 239] as [number, number, number]; // --light-gray (#e9ecef)

    const safeDob = (patient as any).dateOfBirth ? new Date((patient as any).dateOfBirth) : null;
    const visitedDate = patient.visitedDate ? new Date(patient.visitedDate) : ((patient as any).admissionDate ? new Date((patient as any).admissionDate) : null);
    const governorate = (patient as any).governorate as string | undefined;
    const city = (patient as any).city as string | undefined;
    const weight = (patient as any).weight as number | undefined;
    const clinicBranch = (patient as any).clinicBranch as string | undefined;
    const referringDoctor = (patient as any).referringDoctor as string | undefined;
    const presentAtClinic = (patient as any).presentAtClinic as boolean | undefined;
    const checkInTime = (patient as any).clinicCheckInTime as string | undefined;

    const ageDisplay = (() => {
      if (safeDob) {
        const today = new Date();
        let years = today.getFullYear() - safeDob.getFullYear();
        let months = today.getMonth() - safeDob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < safeDob.getDate())) {
          years--;
          months += 12;
        }
        if (years > 0) return months > 0 ? `${years}y ${months}m` : `${years}y`;
        const days = Math.max(0, Math.floor((today.getTime() - safeDob.getTime()) / (1000 * 60 * 60 * 24)));
        return months > 0 ? `${months}m` : `${days}d`;
      }
      return patient.age ? `${patient.age}y` : '—';
    })();

    const text = (valueRaw: string, x: number, y: number, opts?: { bold?: boolean; size?: number; color?: [number, number, number]; align?: 'left' | 'right' | 'center'; rtl?: boolean }) => {
      const size = opts?.size ?? 10;
      const align = opts?.align ?? 'left';
      const color = opts?.color ?? [0, 0, 0];
      const value = (opts?.rtl ?? this.isArabicText(valueRaw)) ? this.shapeArabic(valueRaw) : valueRaw;
      this.doc.setFontSize(size);
      const isArabic = opts?.rtl ?? this.isArabicText(valueRaw);
      const canUseCairo = PDFReportGenerator.arabicFontsLoaded && isArabic;
      this.doc.setFont(canUseCairo ? 'Cairo' : 'helvetica', opts?.bold ? 'bold' : 'normal');
      this.doc.setTextColor(color[0], color[1], color[2]);
      this.doc.text(value, x, y, { align, isInputRtl: isArabic });
    };

    const drawCard = (title: string, y: number) => {
      const cardX = margin;
      const cardW = pageWidth - margin * 2;
      const headerH = 12;
      const padding = 10;

      // Card container (white, bordered like .card)
      this.doc.setFillColor(255, 255, 255);
      this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      this.doc.setLineWidth(0.6);
      this.doc.roundedRect(cardX, y, cardW, headerH + 30, 4, 4, 'FD');

      // Card header strip (light tint like the UI gradients)
      this.doc.setFillColor(235, 248, 250); // ~ rgba(primary, 0.1)
      this.doc.roundedRect(cardX, y, cardW, headerH, 4, 4, 'F');
      // underline header
      this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      this.doc.line(cardX, y + headerH, cardX + cardW, y + headerH);

      text(title, cardX + 8, y + 8.5, { bold: true, size: 11, color: primaryBlue });
      return { x: cardX, w: cardW, headerH, padding };
    };

    const ensurePageSpace = (needed: number) => {
      if (currentY + needed > pageHeight - 15) {
        this.doc.addPage();
        currentY = 20;
      }
    };

    // ===== Header Bar (match navbar: primary blue) =====
    const logoSize = 18;
    const headerH = 26;
    this.doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    this.doc.rect(0, 0, pageWidth, headerH, 'F');
    
    if (logoBase64) {
      try {
        const roundedLogo = await this.createRoundedImage(logoBase64, logoSize);
        this.doc.addImage(roundedLogo, 'PNG', margin, 5, logoSize, logoSize);
      } catch {
        try {
          this.doc.addImage(logoBase64, 'JPEG', margin, 5, logoSize, logoSize);
        } catch {
          // ignore
        }
      }
    }

    text('SurgiCare', margin + logoSize + 8, 14, { bold: true, size: 14, color: [255, 255, 255] });
    text('Patient Report', margin + logoSize + 8, 21, { size: 9, color: [235, 250, 252] });
    text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 14, { size: 9, color: [235, 250, 252], align: 'right' });

    // Status badge
    // const statusStyle = this.getStatusStyle(patient.status);
    const badgeW = 44;
    const badgeH = 9;
    const badgeX = pageWidth - margin - badgeW;
    const badgeY = headerH + 6;
    // Website-style badge: light background + colored text
    const badgeBg = patient.status === 'Diagnosed'
      ? [219, 234, 254] // #dbeafe
      : patient.status === 'Pre-op'
        ? [254, 243, 199] // #fef3c7
        : patient.status === 'Op'
          ? [254, 226, 226] // #fee2e2
          : [220, 252, 231]; // #dcfce7
    const badgeText = patient.status === 'Diagnosed'
      ? [30, 64, 175] // #1e40af
      : patient.status === 'Pre-op'
        ? [146, 64, 14] // #92400e
        : patient.status === 'Op'
          ? [220, 38, 38] // #dc2626
          : [22, 101, 52]; // #166534
    this.doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    this.doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, 'FD');
    text(patient.status === 'Op' ? 'Op' : patient.status, badgeX + badgeW / 2, badgeY + 6.5, {
      size: 9,
      bold: true,
      color: badgeText as [number, number, number],
      align: 'center'
    });

    if (presentAtClinic) {
      const pW = 52;
      this.doc.setFillColor(220, 252, 231); // light green
      this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      this.doc.roundedRect(margin, badgeY, pW, badgeH, 4, 4, 'FD');
      text('Present', margin + pW / 2, badgeY + 6.5, { size: 9, bold: true, color: [22, 101, 52], align: 'center' });
      if (checkInTime) {
        text(`Check-in: ${new Date(checkInTime).toLocaleString('en-GB')}`, margin, badgeY + 15, { size: 8, color: [100, 100, 100] });
      }
    }

    currentY = headerH + 25;

    // ===== Patient Summary Card =====
    ensurePageSpace(60);
    const patientName = patient.fullNameArabic || 'Unknown Patient';
    text(patientName, pageWidth - margin, currentY, { size: 22, bold: true, color: primaryBlue, align: 'right', rtl: true });
    currentY += 10;

    // Code pill
    const pillText = `${t('patients.patientCode')}: ${patient.code}`;
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    this.doc.roundedRect(margin, currentY - 6, 78, 10, 5, 5, 'S');
    text(pillText, margin + 5, currentY, { size: 9, color: dark });

    currentY += 12;

    // Summary grid
    const gridX = margin;
    const gridW = pageWidth - margin * 2;
    const colGap = 8;
    const colCount = 3;
    const colW = (gridW - colGap * (colCount - 1)) / colCount;
    const rowH = 12;

    const infoPairs: Array<[string, string]> = [
      ['Date of Birth', safeDob ? safeDob.toLocaleDateString('en-GB') : '—'],
      ['Age', ageDisplay],
      [t('patients.gender'), patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')],
      ['Weight', weight ? `${weight} kg` : '—'],
      ['Clinic Branch', clinicBranch || '—'],
      ['Referring Doctor', referringDoctor || '—'],
      ['Location', (city && governorate) ? `${city}, ${governorate}` : (city || governorate || '—')],
      [t('patients.visitedDate'), visitedDate ? visitedDate.toLocaleDateString('en-GB') : '—'],
    ];

    // subtle background block for grid like cards
    this.doc.setFillColor(light[0], light[1], light[2]);
    this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    this.doc.roundedRect(margin, currentY - 6, gridW, 36, 6, 6, 'FD');

    let gx = gridX;
    let gy = currentY;
    infoPairs.slice(0, 6).forEach(([label, value], idx) => {
      const c = idx % colCount;
      const r = Math.floor(idx / colCount);
      gx = gridX + c * (colW + colGap);
      gy = currentY + r * rowH;
      text(label, gx, gy, { size: 8, color: [120, 120, 120] });
      text(value, gx, gy + 6, { size: 10, bold: true, color: [0, 0, 0] });
    });

    currentY += 42;

    // ===== Clinical Information Card =====
    ensurePageSpace(55);
    const clinicalCard = drawCard('Clinical Information', currentY);
    currentY += clinicalCard.headerH + 10;
    const diagnosisValue = patient.diagnosis ? patient.diagnosis : 'Undiagnosed';
    const isUndiagnosed = !patient.diagnosis;
    text('Diagnosis', clinicalCard.x + clinicalCard.padding, currentY, { size: 8, color: [120, 120, 120] });
    text(diagnosisValue, clinicalCard.x + clinicalCard.padding, currentY + 7, {
      size: 11,
      bold: true,
      color: isUndiagnosed ? [220, 53, 69] : primaryBlue
    });
    currentY += 18;

    if (patient.notes) {
      text('Notes', clinicalCard.x + clinicalCard.padding, currentY, { size: 8, color: [120, 120, 120] });
      const noteLines = this.doc.splitTextToSize(patient.notes, clinicalCard.w - clinicalCard.padding * 2);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(40, 40, 40);
      noteLines.forEach((line: string, i: number) => {
        this.doc.text(line, clinicalCard.x + clinicalCard.padding, currentY + 7 + i * 6);
      });
      currentY += 10 + noteLines.length * 6;
    }

    // Planned surgery block (if any)
    const planned = patient.plannedSurgery;
    if (planned && (planned.operation || planned.estimatedCost || planned.operationCategory)) {
      ensurePageSpace(28);
      this.doc.setFillColor(255, 251, 235); // similar to warning light
      this.doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      this.doc.roundedRect(clinicalCard.x + clinicalCard.padding, currentY, clinicalCard.w - clinicalCard.padding * 2, 22, 4, 4, 'FD');
      text('Planned Surgery', clinicalCard.x + clinicalCard.padding + 6, currentY + 8, { size: 10, bold: true, color: [146, 64, 14] });
      const plannedLine = [
        planned.operationCategory ? planned.operationCategory : '',
        planned.operation ? planned.operation : '',
      ].filter(Boolean).join(' — ');
      if (plannedLine) {
        text(plannedLine, clinicalCard.x + clinicalCard.padding + 6, currentY + 15, { size: 9, color: [80, 80, 80] });
      }
      if (planned.estimatedCost) {
        text(`Estimated: ${planned.estimatedCost} ${(planned.costCurrency || 'EGP')}`, clinicalCard.x + clinicalCard.w - clinicalCard.padding - 6, currentY + 15, {
          size: 9, bold: true, color: primaryBlue, align: 'right'
        });
      }
      currentY += 28;
    }

    currentY += 10;

    // ===== Surgeries =====
    if (patient.surgeries && patient.surgeries.length > 0) {
      ensurePageSpace(50);
      text('Surgeries', margin, currentY, { size: 13, bold: true, color: primaryBlue });
      currentY += 6;

      const surgeriesTableBody = patient.surgeries.map((s, idx) => {
        const surgeons = (s.surgeons || []).map(x => x.name).filter(Boolean).join(', ');
        const notesShort = s.notes ? (s.notes.length > 60 ? s.notes.slice(0, 57) + '…' : s.notes) : '';
        return [
          String(idx + 1),
          s.date ? new Date(s.date).toLocaleDateString('en-GB') : '',
          (s.operation || s.type || '').toString(),
          s.cost ? `${s.cost} ${(s.costCurrency || 'EGP')}` : '',
          surgeons,
          notesShort
        ];
      });

      autoTable(this.doc, {
        startY: currentY + 4,
        head: [['#', 'Date', 'Operation', 'Cost', 'Surgeons', 'Notes']],
        body: surgeriesTableBody,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: light },
        margin: { left: margin, right: margin }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = ((this.doc as any).lastAutoTable?.finalY || currentY) + 8;

      // Thumbnails per-surgery (first 8 photos)
      for (let i = 0; i < patient.surgeries.length; i++) {
        const surgery: any = patient.surgeries[i] as any;
        const photos: string[] = Array.isArray(surgery.photos) ? surgery.photos : [];
        if (!photos.length) continue;
        ensurePageSpace(32);
        text(`Surgery #${i + 1} Photos`, margin, currentY, { size: 10, bold: true, color: [80, 80, 80] });
        currentY += 6;

        const thumbSize = 18;
        const gap = 4;
        const maxPerRow = Math.floor((pageWidth - margin * 2) / (thumbSize + gap));
        const show = photos.slice(0, 8);
        let x = margin;
        let y = currentY;
        for (let p = 0; p < show.length; p++) {
          const dataUrl = await this.loadImageAsBase64(show[p]);
          if (dataUrl) {
            const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            this.doc.setDrawColor(230, 233, 238);
            this.doc.roundedRect(x, y, thumbSize, thumbSize, 2, 2, 'S');
            try {
              this.doc.addImage(dataUrl, format as any, x, y, thumbSize, thumbSize);
            } catch {
              // ignore
            }
          }
          x += thumbSize + gap;
          if ((p + 1) % maxPerRow === 0) {
            x = margin;
            y += thumbSize + gap;
          }
        }
        currentY = y + thumbSize + 8;
        if (photos.length > show.length) {
          text(`+${photos.length - show.length} more`, pageWidth - margin, currentY - 2, { size: 8, color: [120, 120, 120], align: 'right' });
        }
      }
    }

    // ===== Follow-ups =====
    if (patient.followUps && patient.followUps.length > 0) {
      ensurePageSpace(45);
      text('Follow-ups', margin, currentY, { size: 13, bold: true, color: primaryBlue });
              currentY += 10;
              
      const followUpsTableBody = patient.followUps.map((fu) => {
        const notesShort = fu.notes ? (fu.notes.length > 90 ? fu.notes.slice(0, 87) + '…' : fu.notes) : '';
        return [
          String(fu.number),
          fu.date ? new Date(fu.date).toLocaleDateString('en-GB') : '',
          notesShort
        ];
      });

      autoTable(this.doc, {
        startY: currentY,
        head: [['#', 'Date', 'Notes']],
        body: followUpsTableBody,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: light },
        margin: { left: margin, right: margin }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = ((this.doc as any).lastAutoTable?.finalY || currentY) + 8;

      // Follow-up photos thumbnails (first 12 total)
      const allFollowPhotos = patient.followUps.flatMap((fu) => (fu.photos || []));
      if (allFollowPhotos.length) {
        ensurePageSpace(34);
        text('Follow-up Photos', margin, currentY, { size: 10, bold: true, color: [80, 80, 80] });
        currentY += 6;

        const thumbSize = 16;
        const gap = 4;
        const maxPerRow = Math.floor((pageWidth - margin * 2) / (thumbSize + gap));
        const show = allFollowPhotos.slice(0, 12);
        let x = margin;
        let y = currentY;
        for (let p = 0; p < show.length; p++) {
          const dataUrl = await this.loadImageAsBase64(show[p]);
          if (dataUrl) {
            const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            this.doc.setDrawColor(230, 233, 238);
            this.doc.roundedRect(x, y, thumbSize, thumbSize, 2, 2, 'S');
            try {
              this.doc.addImage(dataUrl, format as any, x, y, thumbSize, thumbSize);
            } catch {
              // ignore
            }
          }
          x += thumbSize + gap;
          if ((p + 1) % maxPerRow === 0) {
            x = margin;
            y += thumbSize + gap;
          }
        }
        currentY = y + thumbSize + 10;
        if (allFollowPhotos.length > show.length) {
          text(`+${allFollowPhotos.length - show.length} more`, pageWidth - margin, currentY - 4, { size: 8, color: [120, 120, 120], align: 'right' });
        }
      }
    }

    // ===== Files / Images =====
    if (patient.files && (patient.files.personalImage || patient.files.surgeryImage || (patient.files.lab?.length || 0) > 0 || (patient.files.radiology?.length || 0) > 0)) {
      ensurePageSpace(55);
      text('Files & Images', margin, currentY, { size: 13, bold: true, color: primaryBlue });
      currentY += 10;

      const thumbSize = 28;
      const gap = 8;
      let x = margin;
      let y = currentY;

      const imageSlots: Array<{ label: string; url?: string }> = [
        { label: 'Personal Image', url: patient.files.personalImage },
        { label: 'Patient Sheet Image', url: patient.files.surgeryImage },
      ];

      for (const slot of imageSlots) {
        if (!slot.url) continue;
        ensurePageSpace(thumbSize + 16);
        const dataUrl = await this.loadImageAsBase64(slot.url);
        if (dataUrl) {
          const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          this.doc.setDrawColor(230, 233, 238);
          this.doc.roundedRect(x, y, thumbSize, thumbSize, 3, 3, 'S');
          try {
            this.doc.addImage(dataUrl, format as any, x, y, thumbSize, thumbSize);
          } catch {
            // ignore
          }
          text(slot.label, x, y + thumbSize + 6, { size: 8, color: [120, 120, 120] });
          x += thumbSize + gap;
        }
      }

      currentY = y + thumbSize + 18;
      const labCount = patient.files.lab?.length || 0;
      const radCount = patient.files.radiology?.length || 0;
      text(`Lab files: ${labCount}`, margin, currentY, { size: 9, color: [80, 80, 80] });
      text(`X-ray/Radiology files: ${radCount}`, margin + 70, currentY, { size: 9, color: [80, 80, 80] });
      currentY += 12;
    }

    // Footer (page number + confidential)
    const totalPages = this.doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      this.doc.setPage(p);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
      this.doc.text(`SurgiCare Clinic — Confidential`, margin, pageHeight - 10);
      this.doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  }
}

export const generatePDFReport = {
  patients: (patients: Patient[], title?: string) => {
    const generator = new PDFReportGenerator();
    generator.generatePatientReport(patients, title);
    generator.download(`patients-report-${new Date().toISOString().split('T')[0]}.pdf`);
  },
  
  statistics: (stats: DashboardStats, title?: string) => {
    const generator = new PDFReportGenerator();
    generator.generateStatisticsReport(stats, title);
    generator.download(`statistics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  },
  
  dashboard: (patients: Patient[], stats: DashboardStats, title?: string) => {
    const generator = new PDFReportGenerator();
    generator.generateDashboardReport(patients, stats, title);
    generator.download(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  singlePatient: async (patient: Patient, t: (key: string) => string) => {
    const generator = new PDFReportGenerator();
    await generator.generateSinglePatientPDF(patient, t);
    const datePart = new Date().toISOString().split('T')[0];
    // include Arabic name in filename (sanitized)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const namePart = generator['sanitizeFilenamePart']((patient.fullNameArabic || '').toString());
    const filename = namePart
      ? `patient-${patient.code}-${namePart}-${datePart}.pdf`
      : `patient-${patient.code}-${datePart}.pdf`;
    generator.download(filename);
  },
};