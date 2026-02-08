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
  tagline: '',
  address: 'cairo, egypt',
  phone: '+201016077676',
  email: 'Surgicareped@gmail.com',
  website: 'Facebook.com/surgicareped',
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
        case 'Diagnosed': return '#17a2b8'; // Teal
        case 'Pre-op': return '#ffc107';    // Warning amber
        case 'Op': return '#dc3545';         // Danger red
        case 'Post-op': return '#28a745';    // Success green
        default: return '#6c757d';           // Gray
      }
    };

    // Date only, no time
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div ref={ref} className="printable-report">
        <div className="report-page">
          {/* Header */}
          <header className="report-header">
            <div className="header-left">
              <img 
                src={clinicInfo?.logo || '/imgs/logo.jpg'} 
                alt="Logo" 
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
            <p className="report-generated">Generated on {currentDate}</p>
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
                  <span className="info-value">
                    {(() => {
                      if ((patient as any).dateOfBirth) {
                        const dob = new Date((patient as any).dateOfBirth);
                        const today = new Date();
                        let years = today.getFullYear() - dob.getFullYear();
                        let months = today.getMonth() - dob.getMonth();
                        let days = today.getDate() - dob.getDate();
                        
                        if (days < 0) {
                          months--;
                          days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                        }
                        if (months < 0) {
                          years--;
                          months += 12;
                        }
                        
                        if (years > 0) {
                          return months > 0 ? `${years} years ${months} months` : `${years} years`;
                        } else if (months > 0) {
                          return days > 0 ? `${months} months ${days} days` : `${months} months`;
                        } else {
                          return `${days} days`;
                        }
                      } else {
                        const years = Math.floor(patient.age);
                        const months = Math.round((patient.age - years) * 12);
                        return months > 0 ? `${years} years ${months} months` : `${years} years`;
                      }
                    })()}
                  </span>
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
              </div>
            </section>
          )}

          {/* Diagnosis Section */}
          <section className="diagnosis-section">
            <h3 className="section-title">Diagnosis</h3>
            <table className="diagnosis-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Diagnosis</th>
                  <th>Referring Doctor</th>
                </tr>
              </thead>
              <tbody>
                {((patient as any).diagnoses && (patient as any).diagnoses.length > 0) ? (
                  (patient as any).diagnoses.map((diag: string, index: number) => {
                    const categories = (patient as any).diagnosisCategories || [];
                    return (
                      <tr key={index}>
                        <td>{categories[index] || patient.diagnosisCategory || 'General'}</td>
                        <td>{diag}</td>
                        <td>{index === 0 ? (patient.referringDoctor || 'N/A') : ''}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td>{patient.diagnosisCategory || 'General'}</td>
                    <td>{patient.diagnosis || 'N/A'}</td>
                    <td>{patient.referringDoctor || 'N/A'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Surgery History Section */}
          {patient.surgeries && patient.surgeries.length > 0 && (
            <section className="surgery-section">
              <h3 className="section-title">Surgery History</h3>
              <table className="surgery-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Operation</th>
                    <th>Surgeon(s)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.surgeries.map((surgery, index) => (
                    <tr key={surgery.id || index}>
                      <td>{formatDate(surgery.date)}</td>
                      <td>{surgery.type || 'N/A'}</td>
                      <td>{surgery.operation || 'N/A'}</td>
                      <td>{surgery.surgeons?.map(s => s.name).join(', ') || 'N/A'}</td>
                      <td>{surgery.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Follow-ups Section */}
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

          {/* Clinical Notes */}
          {patient.notes && (
            <section className="notes-section">
              <h3 className="section-title">Clinical Notes</h3>
              <div className="notes-content">
                <p>{patient.notes}</p>
              </div>
            </section>
          )}

          {/* Doctor Signature */}
          <section className="signature-section">
            <div className="signature-single">
              <div className="signature-box doctor-signature">
                {signatureImage && (
                  <img 
                    src={signatureImage} 
                    alt="Signature" 
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

          {/* Footer */}
          <footer className="report-footer">
            <div className="footer-divider"></div>
            <div className="footer-content">
              <div className="footer-left">
                <p className="footer-clinic">{clinicInfo?.name || 'SurgiCare'}</p>
              </div>
              <div className="footer-right">
                <p>Page 1 of 1</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
