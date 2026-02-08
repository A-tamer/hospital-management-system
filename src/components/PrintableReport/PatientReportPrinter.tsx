import React, { useRef, useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Patient } from '../../types';
import PrintableReport from './PrintableReport';
import './PatientReportPrinter.css';

// We'll use the browser's print to PDF feature with a hidden iframe
interface PatientReportPrinterProps {
  patient: Patient;
  clinicInfo?: {
    name: string;
    tagline?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };
  reportTitle?: string;
  doctorName?: string;
  doctorTitle?: string;
  signatureImage?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const PatientReportPrinter: React.FC<PatientReportPrinterProps> = ({
  patient,
  clinicInfo,
  reportTitle,
  doctorName = 'Prof. Doctor Tamer Ashraf',
  doctorTitle = 'Consultant Pediatric Surgeon',
  signatureImage = '/imgs/signature-tamer-ashraf.png',
  buttonText = 'Export PDF',
  className = '',
  disabled = false,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = useCallback(async () => {
    if (!componentRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = componentRef.current;
      
      // Get all report pages
      const pages = element.querySelectorAll('.report-page');
      
      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Render page to canvas with optimized quality
        const canvas = await html2canvas(page, {
          scale: 2, // Balanced quality and file size
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
        });

        // Convert to JPEG with compression for smaller file size
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Calculate dimensions to fit A4
        const imgWidth = a4Width;
        const imgHeight = (canvas.height * a4Width) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, a4Height));
      }

      // Generate filename
      const filename = `Patient_Report_${patient.code || patient.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print dialog
      window.print();
    } finally {
      setIsGenerating(false);
    }
  }, [patient, isGenerating]);

  return (
    <>
      <button
        onClick={handleExportPDF}
        className={`export-pdf-btn ${className}`}
        disabled={disabled || isGenerating}
        style={{ 
          background: isGenerating ? '#9ca3af' : '#17a2b8', 
          color: 'white', 
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: 500,
          cursor: disabled || isGenerating ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <Download size={16} />
        {isGenerating ? 'Generating PDF...' : buttonText}
      </button>

      {/* Hidden printable component for PDF generation */}
      <div 
        ref={componentRef} 
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          background: 'white',
        }}
      >
        <PrintableReport
          patient={patient}
          clinicInfo={clinicInfo}
          reportTitle={reportTitle}
          doctorName={doctorName}
          doctorTitle={doctorTitle}
          signatureImage={signatureImage}
        />
      </div>
    </>
  );
};

export default PatientReportPrinter;
