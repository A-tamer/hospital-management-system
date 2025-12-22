import jsPDF from 'jspdf';
import { Patient, DashboardStats } from '../types';

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
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
    const pageWidth = this.doc.internal.pageSize.width;
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

    // Header with rounded logo (left aligned with text on right)
    const logoSize = 40;
    
    if (logoBase64) {
      try {
        // Create rounded logo at high resolution
        const roundedLogo = await this.createRoundedImage(logoBase64, logoSize);
        // Add with high quality (no compression flag = best quality)
        this.doc.addImage(roundedLogo, 'PNG', margin, currentY, logoSize, logoSize);
      } catch (error) {
        console.log('Could not create rounded logo, using regular image');
        try {
          this.doc.addImage(logoBase64, 'JPEG', margin, currentY, logoSize, logoSize);
        } catch (e) {
          console.log('Could not add logo image');
        }
      }
    }
    
    // Clinic name (right of logo)
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(23, 162, 184); // #17a2b8
    const clinicName = 'SurgiCare Clinic Dr. Tamer Ashraf';
    this.doc.text(clinicName, margin + logoSize + 10, currentY + 15);
    
    // Patient name as main title (below logo, left aligned)
    currentY += logoSize + 15;
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    const patientName = patient.fullNameArabic || 'Unknown Patient';
    this.doc.text(patientName, margin, currentY);
    
    // Patient code (below name)
    currentY += 12;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`${t('patients.patientCode')}: ${patient.code}`, margin, currentY);
    
    // Divider line
    currentY += 18;
    this.doc.setDrawColor(23, 162, 184);
    this.doc.setLineWidth(1);
    this.doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 20;

    // Basic Information Section - Two column layout
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(23, 162, 184);
    this.doc.text(t('detail.basicInfo'), margin, currentY);
    currentY += 12;

    // Two column layout for better structure
    const col1X = margin;
    const col2X = pageWidth / 2 + 10;
    const colWidth = (pageWidth - margin * 2 - 20) / 2;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    // Column 1
    let col1Y = currentY;
    const col1Items = [
      [t('form.age'), `${patient.age} ${t('stats.years')}`],
      [t('form.gender'), patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')],
    ];

    col1Items.forEach(([label, value]) => {
      if (col1Y > this.doc.internal.pageSize.height - 30) {
        this.doc.addPage();
        col1Y = 20;
        currentY = 20;
      }
      
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(label + ':', col1X, col1Y);
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(value, col1X + 40, col1Y);
      this.doc.setFont('helvetica', 'normal');
      col1Y += 10;
    });

    // Column 2
    let col2Y = currentY;
    const col2Items = [
      [t('form.diagnosis'), patient.diagnosis],
      [t('form.visitedDate'), new Date(patient.visitedDate).toLocaleDateString()],
    ];

    col2Items.forEach(([label, value]) => {
      if (col2Y > this.doc.internal.pageSize.height - 30) {
        this.doc.addPage();
        col2Y = 20;
        currentY = 20;
      }
      
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(label + ':', col2X, col2Y);
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'bold');
      // For diagnosis, allow text wrapping
      const valueLines = this.doc.splitTextToSize(value, colWidth - 50);
      valueLines.forEach((line: string, index: number) => {
        this.doc.text(line, col2X + 40, col2Y + (index * 7));
      });
      this.doc.setFont('helvetica', 'normal');
      col2Y += Math.max(10, valueLines.length * 7);
    });

    // Update currentY to the maximum of both columns
    currentY = Math.max(col1Y, col2Y) + 5;

    // Contact Information (if available) - Simplified
    if (patient.contactInfo && (patient.contactInfo.name || patient.contactInfo.phone)) {
      currentY += 15;
      if (currentY > this.doc.internal.pageSize.height - 50) {
        this.doc.addPage();
        currentY = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(23, 162, 184);
      this.doc.text(t('detail.contactInfo'), margin, currentY);
      currentY += 12;

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      
      if (patient.contactInfo.phone) {
        this.doc.setTextColor(120, 120, 120);
        this.doc.text(t('form.phone') + ':', margin, currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(patient.contactInfo.phone, margin + 50, currentY);
        this.doc.setFont('helvetica', 'normal');
        currentY += 10;
      }
      
      if (patient.contactInfo.name) {
        this.doc.setTextColor(120, 120, 120);
        this.doc.text(t('form.contactName') + ':', margin, currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(patient.contactInfo.name, margin + 50, currentY);
        this.doc.setFont('helvetica', 'normal');
        currentY += 10;
      }
    }

    // Medical Notes (if available)
    if (patient.notes) {
      currentY += 15;
      if (currentY > this.doc.internal.pageSize.height - 50) {
        this.doc.addPage();
        currentY = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(23, 162, 184);
      this.doc.text(t('detail.medicalNotes'), margin, currentY);
      currentY += 12;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      const notesLines = this.doc.splitTextToSize(patient.notes, pageWidth - (margin * 2));
      notesLines.forEach((line: string) => {
        if (currentY > this.doc.internal.pageSize.height - 20) {
          this.doc.addPage();
          currentY = 20;
        }
        this.doc.text(line, margin, currentY);
        currentY += 7;
      });
    }

    // Surgeries Section
    if (patient.surgeries && patient.surgeries.length > 0) {
      currentY += 20;
      if (currentY > this.doc.internal.pageSize.height - 50) {
        this.doc.addPage();
        currentY = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(23, 162, 184);
      this.doc.text(t('detail.surgeryDetails'), margin, currentY);
      currentY += 12;

      for (let i = 0; i < patient.surgeries.length; i++) {
        const surgery = patient.surgeries[i];
        
        if (currentY > this.doc.internal.pageSize.height - 80) {
          this.doc.addPage();
          currentY = 20;
        }

        // Surgery header - cleaner design
        this.doc.setFillColor(245, 250, 255);
        this.doc.roundedRect(margin, currentY - 6, pageWidth - (margin * 2), 10, 3, 3, 'F');
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(23, 162, 184);
        this.doc.text(`${t('detail.surgery')} #${i + 1}: ${surgery.type || t('detail.surgery')}`, margin + 8, currentY);
        currentY += 15;

        // Surgery details - complete information
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        // Surgery Date
        this.doc.setTextColor(120, 120, 120);
        this.doc.text(t('form.surgeryDate') + ':', margin + 8, currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(new Date(surgery.date).toLocaleDateString(), margin + 55, currentY);
        this.doc.setFont('helvetica', 'normal');
        currentY += 10;

        // Surgery Cost (if available)
        if (surgery.cost) {
          this.doc.setTextColor(120, 120, 120);
          this.doc.text(t('detail.cost') + ':', margin + 8, currentY);
          this.doc.setTextColor(0, 0, 0);
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(`${surgery.cost} ${surgery.costCurrency || 'USD'}`, margin + 55, currentY);
          this.doc.setFont('helvetica', 'normal');
          currentY += 10;
        }

        if (surgery.surgeons && surgery.surgeons.length > 0) {
          this.doc.setTextColor(120, 120, 120);
          this.doc.text(t('form.surgeons') + ':', margin + 8, currentY);
          currentY += 8;
          surgery.surgeons.forEach((surgeon) => {
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`  • ${surgeon.name}`, margin + 12, currentY);
            if (surgeon.specialization) {
              this.doc.setFont('helvetica', 'normal');
              this.doc.setTextColor(100, 100, 100);
              this.doc.setFontSize(9);
              this.doc.text(`    (${surgeon.specialization})`, margin + 12, currentY + 7);
              this.doc.setFontSize(10);
              currentY += 7;
            }
            currentY += 8;
          });
          this.doc.setFont('helvetica', 'normal');
        }

        if (surgery.notes) {
          currentY += 6;
          this.doc.setTextColor(120, 120, 120);
          this.doc.text(t('form.notes') + ':', margin + 8, currentY);
          currentY += 8;
          this.doc.setTextColor(0, 0, 0);
          const notesLines = this.doc.splitTextToSize(surgery.notes, pageWidth - (margin * 2) - 16);
          notesLines.forEach((line: string) => {
            if (currentY > this.doc.internal.pageSize.height - 20) {
              this.doc.addPage();
              currentY = 20;
            }
            this.doc.text(line, margin + 12, currentY);
            currentY += 7;
          });
        }

        // Surgery Image (if available)
        if (patient.files?.surgeryImage) {
          currentY += 10;
          if (currentY > this.doc.internal.pageSize.height - 100) {
            this.doc.addPage();
            currentY = 20;
          }

          try {
            const surgeryImageBase64 = await this.loadImageAsBase64(patient.files.surgeryImage);
            if (surgeryImageBase64) {
              this.doc.setFontSize(9);
              this.doc.setTextColor(120, 120, 120);
              this.doc.text(t('detail.surgeryImage') + ':', margin + 8, currentY);
              currentY += 10;
              
              // Add image (max width 80mm, maintain aspect ratio)
              const imgWidth = 80;
              const imgHeight = 60; // Fixed height for consistency
              this.doc.addImage(surgeryImageBase64, 'JPEG', margin + 8, currentY, imgWidth, imgHeight);
              currentY += imgHeight + 15;
            }
          } catch (error) {
            console.error('Error loading surgery image:', error);
          }
        }

        currentY += 12;
      }
    }

    // Follow-ups Section
    if (patient.followUps && patient.followUps.length > 0) {
      currentY += 15;
      if (currentY > this.doc.internal.pageSize.height - 50) {
        this.doc.addPage();
        currentY = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(23, 162, 184);
      this.doc.text(t('form.followUps'), margin, currentY);
      currentY += 12;

      patient.followUps.forEach((followUp) => {
        if (currentY > this.doc.internal.pageSize.height - 40) {
          this.doc.addPage();
          currentY = 20;
        }

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFillColor(248, 250, 252);
        this.doc.roundedRect(margin, currentY - 6, pageWidth - (margin * 2), 22, 3, 3, 'F');
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(23, 162, 184);
        this.doc.text(`${t('detail.followUp')} #${followUp.number}`, margin + 8, currentY);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(120, 120, 120);
        this.doc.setFontSize(9);
        this.doc.text(new Date(followUp.date).toLocaleDateString(), pageWidth - margin - 30, currentY);
        
        if (followUp.notes) {
          currentY += 10;
          this.doc.setTextColor(0, 0, 0);
          this.doc.setFontSize(9);
          const notesLines = this.doc.splitTextToSize(followUp.notes, pageWidth - (margin * 2) - 16);
          notesLines.forEach((line: string) => {
            this.doc.text(line, margin + 8, currentY);
            currentY += 6;
          });
        }
        
        currentY += 10;
      });
    }

    // Footer
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
    this.doc.text('Hospital Management System - Confidential', pageWidth - margin - 60, pageHeight - 10, { align: 'right' });
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
    const filename = `patient-${patient.code}-${new Date().toISOString().split('T')[0]}.pdf`;
    generator.download(filename);
  },
};