import jsPDF from 'jspdf';
import { Patient, DashboardStats } from '../types';

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, subtitle?: string) {
    // Hospital Logo/Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Hospital Management System', 20, 30);
    
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
    this.doc.text('Hospital Management System - Confidential', 120, pageHeight - 10);
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
    
    // Prepare table data
    const tableData = patients.map(patient => [
      patient.code,
      patient.fullNameArabic || 'No Name',
      `${patient.age} years`,
      patient.gender,
      patient.diagnosis,
      new Date(patient.visitedDate || (patient as any).admissionDate).toLocaleDateString(),
      'N/A', // Discharge date removed
      patient.status,
      patient.notes || 'N/A'
    ]);

    const headers = ['Code', 'Name (Arabic)', 'Age', 'Gender', 'Diagnosis', 'Admission', 'Discharge', 'Status', 'Notes'];
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
};