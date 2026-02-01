import React, { forwardRef } from 'react';
import { Patient } from '../../types';
import './PrintableReport.css';

interface PrintableReportProps {
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
}

const defaultClinicInfo: PrintableReportProps['clinicInfo'] = {
  name: 'SurgiCare',
  tagline: 'Excellence in Pediatric Surgery',
  address: 'Cairo Medical District, Egypt',
  phone: '+20 123 456 7890',
  email: 'info@surgicare.com',
  website: 'www.surgicare.com',
  logo: '/imgs/logo.jpg',
};

const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ 
    patient, 
    clinicInfo = defaultClinicInfo, 
    reportTitle = 'Patient Medical Report', 
    doctorName = 'Prof. Doctor Tamer Ashraf',
    doctorTitle = 'Consultant Pediatric Surgeon',
    signatureImage = '/imgs/signature-tamer-ashraf.png'
  }, ref) => {
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return dateString;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Diagnosed': return '#4f46e5'; // Primary indigo
        case 'Pre-op': return '#f59e0b';    // Warning amber
        case 'Op': return '#ef4444';         // Danger red
        case 'Post-op': return '#10b981';    // Success green
        default: return '#6b7280';           // Gray
      }
    };

    const currentDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div ref={ref} className="printable-report">
        {/* Page 1: Main Patient Information */}
        <div className="report-page">
          {/* Header */}
          <header className="report-header">
            <div className="header-left">
              <img 
                src={clinicInfo?.logo || '/imgs/logo.jpg'} 
                alt="SurgiCare Logo" 
                className="clinic-logo"
                crossOrigin="anonymous"
              />
              <div className="clinic-info">
                <h1 className="clinic-name">{clinicInfo?.name || 'SurgiCare'}</h1>
                {clinicInfo?.tagline && <p className="clinic-tagline">{clinicInfo.tagline}</p>}
              </div>
            </div>
            <div className="header-right">
              <p><strong>Phone:</strong> {clinicInfo?.phone}</p>
              <p><strong>Email:</strong> {clinicInfo?.email}</p>
              {clinicInfo?.website && <p><strong>Web:</strong> {clinicInfo.website}</p>}
              <p className="header-address">{clinicInfo?.address}</p>
            </div>
          </header>

          <div className="header-divider"></div>

          {/* Report Title */}
          <div className="report-title-section">
            <h2 className="report-title">{reportTitle}</h2>
            <p className="report-generated">Generated on: {currentDate}</p>
          </div>

          {/* Patient Information Section */}
          <section className="patient-info-section">
            <h3 className="section-title">Patient Information</h3>
            <div className="patient-info-grid">
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Patient Name (Arabic)</span>
                  <span className="info-value arabic-text">{patient.fullNameArabic || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Patient Code</span>
                  <span className="info-value">{patient.code || 'N/A'}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Age</span>
                  <span className="info-value">{patient.age ? `${patient.age} Years` : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{patient.gender || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Weight</span>
                  <span className="info-value">{patient.weight ? `${patient.weight} kg` : 'N/A'}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Visit Date</span>
                  <span className="info-value">{formatDate(patient.visitedDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span 
                    className="info-value status-badge"
                    style={{ backgroundColor: getStatusColor(patient.status), color: 'white' }}
                  >
                    {patient.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Clinic Branch</span>
                  <span className="info-value">{patient.clinicBranch || 'N/A'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          {patient.contactInfo && (
            <section className="contact-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="patient-info-grid">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Contact Name</span>
                    <span className="info-value">{patient.contactInfo.name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{patient.contactInfo.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Relation</span>
                    <span className="info-value">{patient.contactInfo.relation || 'N/A'}</span>
                  </div>
                </div>
                {(patient.contactInfo.email || patient.contactInfo.address) && (
                  <div className="info-row">
                    {patient.contactInfo.email && (
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{patient.contactInfo.email}</span>
                      </div>
                    )}
                    {patient.contactInfo.address && (
                      <div className="info-item full-width">
                        <span className="info-label">Address</span>
                        <span className="info-value">{patient.contactInfo.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Diagnosis Section */}
          <section className="diagnosis-section">
            <h3 className="section-title">Diagnosis</h3>
            <div className="diagnosis-content">
              <table className="diagnosis-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Diagnosis</th>
                    <th>Referring Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{patient.diagnosisCategory || 'General'}</td>
                    <td>{patient.diagnosis || 'N/A'}</td>
                    <td>{patient.referringDoctor || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Clinical Notes */}
          {patient.notes && (
            <section className="notes-section">
              <h3 className="section-title">Clinical Notes</h3>
              <div className="notes-content">
                <p>{patient.notes}</p>
              </div>
            </section>
          )}

          {/* Doctor Signature - Always show on page 1 if no surgeries */}
          {(!patient.surgeries || patient.surgeries.length === 0) && (
            <section className="signature-section page1-signature">
              <div className="signature-single">
                <div className="signature-box doctor-signature">
                  {signatureImage && (
                    <img 
                      src={signatureImage} 
                      alt="Doctor Signature" 
                      className="signature-image"
                      crossOrigin="anonymous"
                    />
                  )}
                  <div className="signature-line"></div>
                  <p className="signature-name">{doctorName}</p>
                  <p className="signature-title">{doctorTitle}</p>
                </div>
              </div>
              <div className="end-of-report">
                <p>****End of Report****</p>
              </div>
            </section>
          )}

          {/* Footer for Page 1 */}
          <footer className="report-footer">
            <div className="footer-divider"></div>
            <div className="footer-content">
              <div className="footer-left">
                <p className="confidential">CONFIDENTIAL - Medical Report</p>
                <p className="footer-clinic">{clinicInfo?.name || 'SurgiCare'}</p>
              </div>
              <div className="footer-right">
                <p>Page 1 of {patient.surgeries && patient.surgeries.length > 0 ? '2' : '1'}</p>
              </div>
            </div>
          </footer>
        </div>

        {/* Page 2: Surgery History (if exists) */}
        {patient.surgeries && patient.surgeries.length > 0 && (
          <div className="report-page page-break">
            {/* Mini Header */}
            <header className="report-header mini-header">
              <div className="header-left">
                <img 
                  src={clinicInfo?.logo || '/imgs/logo.jpg'} 
                  alt="SurgiCare Logo" 
                  className="clinic-logo-small"
                  crossOrigin="anonymous"
                />
                <h2 className="clinic-name-small">{clinicInfo?.name || 'SurgiCare'}</h2>
              </div>
              <div className="header-right">
                <p><strong>Patient:</strong> {patient.fullNameArabic}</p>
                <p><strong>Code:</strong> {patient.code}</p>
              </div>
            </header>

            <div className="header-divider"></div>

            {/* Surgery History */}
            <section className="surgery-section">
              <h3 className="section-title">Surgery History</h3>
              <table className="surgery-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Operation</th>
                    <th>Surgeon(s)</th>
                    <th>Cost</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.surgeries.map((surgery, index) => (
                    <tr key={surgery.id || index}>
                      <td>{formatDate(surgery.date)}</td>
                      <td>{surgery.type || 'N/A'}</td>
                      <td>{surgery.operation || 'N/A'}</td>
                      <td>
                        {surgery.surgeons?.map(s => s.name).join(', ') || 'N/A'}
                      </td>
                      <td>
                        {surgery.cost 
                          ? `${surgery.cost.toLocaleString()} ${surgery.costCurrency || 'EGP'}`
                          : 'N/A'
                        }
                      </td>
                      <td>{surgery.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Planned Surgery (if exists) */}
            {patient.plannedSurgery && (
              <section className="planned-surgery-section">
                <h3 className="section-title">Planned Surgery</h3>
                <div className="patient-info-grid">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Category</span>
                      <span className="info-value">{patient.plannedSurgery.operationCategory || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Operation</span>
                      <span className="info-value">{patient.plannedSurgery.operation || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estimated Cost</span>
                      <span className="info-value">
                        {patient.plannedSurgery.estimatedCost 
                          ? `${patient.plannedSurgery.estimatedCost.toLocaleString()} ${patient.plannedSurgery.costCurrency || 'EGP'}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Follow-ups (if exists) */}
            {patient.followUps && patient.followUps.length > 0 && (
              <section className="followups-section">
                <h3 className="section-title">Follow-up History</h3>
                <table className="followup-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.followUps.map((followUp, index) => (
                      <tr key={followUp.id || index}>
                        <td>{followUp.number || index + 1}</td>
                        <td>{formatDate(followUp.date)}</td>
                        <td>{followUp.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Doctor Signature Section */}
            <section className="signature-section">
              <div className="signature-single">
                <div className="signature-box doctor-signature">
                  {signatureImage && (
                    <img 
                      src={signatureImage} 
                      alt="Doctor Signature" 
                      className="signature-image"
                      crossOrigin="anonymous"
                    />
                  )}
                  <div className="signature-line"></div>
                  <p className="signature-name">{doctorName}</p>
                  <p className="signature-title">{doctorTitle}</p>
                </div>
              </div>
            </section>

            {/* Footer for Page 2 */}
            <footer className="report-footer">
              <div className="footer-divider"></div>
              <div className="footer-content">
                <div className="footer-left">
                  <p className="confidential">CONFIDENTIAL - Medical Report</p>
                  <p className="footer-clinic">{clinicInfo?.name || 'SurgiCare'}</p>
                </div>
                <div className="footer-center">
                  <p>****End of Report****</p>
                </div>
                <div className="footer-right">
                  <p>Page 2 of 2</p>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
