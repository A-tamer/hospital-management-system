import React, { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Eye } from 'lucide-react';
import { Patient } from '../../types';
import PrintableReport from './PrintableReport';
import './PatientReportPrinter.css';

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
  buttonStyle?: 'icon' | 'full' | 'compact';
  showPreview?: boolean;
  className?: string;
}

const PatientReportPrinter: React.FC<PatientReportPrinterProps> = ({
  patient,
  clinicInfo,
  reportTitle,
  doctorName,
  doctorTitle,
  buttonStyle = 'full',
  showPreview = false,
  className = '',
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Patient_Report_${patient.code || patient.id}_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          height: 297mm;
          width: 210mm;
        }
      }
    `,
    onBeforePrint: () => {
      console.log('Preparing to print patient report...');
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Print completed or cancelled');
      if (isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    },
  });

  const handlePrintClick = useCallback(() => {
    if (handlePrint) {
      handlePrint();
    }
  }, [handlePrint]);

  const handlePreviewClick = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const renderButton = () => {
    switch (buttonStyle) {
      case 'icon':
        return (
          <button
            onClick={handlePrintClick}
            className={`print-btn print-btn-icon ${className}`}
            title="Print Patient Report"
          >
            <Printer size={18} />
          </button>
        );
      case 'compact':
        return (
          <button
            onClick={handlePrintClick}
            className={`print-btn print-btn-compact ${className}`}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        );
      default:
        return (
          <div className={`print-btn-group ${className}`}>
            {showPreview && (
              <button
                onClick={handlePreviewClick}
                className="print-btn print-btn-secondary"
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
            )}
            <button
              onClick={handlePrintClick}
              className="print-btn print-btn-primary"
            >
              <Printer size={16} />
              <span>Print Report</span>
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Hidden printable component */}
      <div style={{ display: 'none' }}>
        <PrintableReport
          ref={componentRef}
          patient={patient}
          clinicInfo={clinicInfo}
          reportTitle={reportTitle}
          doctorName={doctorName}
          doctorTitle={doctorTitle}
        />
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="report-preview-overlay" onClick={handleClosePreview}>
          <div className="report-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="report-preview-header">
              <h3>Report Preview</h3>
              <div className="report-preview-actions">
                <button
                  onClick={handlePrintClick}
                  className="print-btn print-btn-primary"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleClosePreview}
                  className="print-btn print-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="report-preview-content">
              <PrintableReport
                patient={patient}
                clinicInfo={clinicInfo}
                reportTitle={reportTitle}
                doctorName={doctorName}
                doctorTitle={doctorTitle}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientReportPrinter;
