import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, User, Heart, FileText, Image as ImageIcon, UserCircle, Download, LogIn, LogOut, Printer } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useToast } from '../components/Toast';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { PatientReportPrinter } from '../components/PrintableReport';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = usePatientContext();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { updatePatient } = useFirebaseOperations();
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isUpdatingPresence, setIsUpdatingPresence] = useState(false);

  const patient = state.patients.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="patients-page fade-in">
        <div className="card">
          <div className="empty-state">
            <User className="empty-icon" />
            <p>{t('detail.patientNotFound')}</p>
            <button className="btn btn-primary" onClick={() => navigate('/patients')}>
              <ArrowLeft className="btn-icon" />
              {t('detail.backToPatients')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/patients`, { state: { editPatientId: patient.id } });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generatePDFReport.singlePatient(patient, t);
      showSuccess(t('detail.pdfExported') || 'Patient PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      showError(t('detail.pdfError') || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCheckIn = async () => {
    if (!patient.id) return;
    setIsUpdatingPresence(true);
    try {
      await updatePatient(patient.id, {
        ...patient,
        presentAtClinic: true,
        clinicCheckInTime: new Date().toISOString()
      } as any);
      showSuccess('Patient checked in successfully');
    } catch (error) {
      console.error('Check-in error:', error);
      showError('Failed to check in patient. Please try again.');
    } finally {
      setIsUpdatingPresence(false);
    }
  };

  const handleCheckOut = async () => {
    if (!patient.id) return;
    setIsUpdatingPresence(true);
    try {
      await updatePatient(patient.id, {
        ...patient,
        presentAtClinic: false,
        clinicCheckInTime: undefined
      } as any);
      showSuccess('Patient checked out successfully');
    } catch (error) {
      console.error('Check-out error:', error);
      showError('Failed to check out patient. Please try again.');
    } finally {
      setIsUpdatingPresence(false);
    }
  };

  return (
    <div className="patients-page fade-in" style={{ padding: '2rem', maxWidth: '100%' }}>
      {/* Patient Header Card */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.1) 0%, rgba(43, 122, 120, 0.1) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                {patient.files?.personalImage ? (
              <img 
                src={patient.files.personalImage} 
                alt={patient.fullNameArabic || 'Patient'}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--primary-blue)',
                  boxShadow: '0 4px 12px rgba(58, 175, 169, 0.3)'
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(58, 175, 169, 0.3)'
              }}>
                {(patient.fullNameArabic || 'N').charAt(0)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 className="page-title" style={{ marginBottom: '0.5rem', fontSize: '2rem', direction: 'rtl', textAlign: 'right' }}>
                {patient.fullNameArabic || 'No Name'}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'var(--white)', 
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--primary-dark)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {t('patients.patientCode')}: {patient.code}
                </span>
                <span className={`status-badge status-${patient.status.toLowerCase().replace('-', '-')}`}>
                  {patient.status === 'Diagnosed' ? t('status.diagnosed') : 
                   patient.status === 'Pre-op' ? t('status.preOp') : 
                   patient.status === 'Op' ? 'Op' :
                   t('status.postOp')}
                </span>
                
                {/* Present at Clinic Indicator */}
                {(patient as any).presentAtClinic && (
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#28a745', 
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'pulse 2s infinite'
                  }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      background: 'white', 
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}></span>
                    Present at Clinic
                    {(patient as any).clinicCheckInTime && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        (Since {new Date((patient as any).clinicCheckInTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
              <ArrowLeft className="btn-icon" />
              {t('detail.backToPatients')}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              style={{ background: '#17a2b8', color: 'white', border: 'none' }}
            >
              <Download className="btn-icon" />
              {isExportingPDF ? (t('detail.exportingPDF') || 'Generating PDF...') : (t('detail.exportPDF') || 'Export PDF')}
            </button>
            
            {/* Print Professional Report */}
            <PatientReportPrinter
              patient={patient}
              buttonStyle="compact"
              showPreview={true}
              doctorName="Dr. Wafa"
              doctorTitle="MD, Surgeon"
            />
            
            {/* Check-In / Check-Out Buttons */}
            {(patient as any).presentAtClinic ? (
              <button 
                className="btn" 
                onClick={handleCheckOut}
                disabled={isUpdatingPresence}
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut className="btn-icon" />
                {isUpdatingPresence ? 'Checking Out...' : 'Check Out'}
              </button>
            ) : (
              <button 
                className="btn" 
                onClick={handleCheckIn}
                disabled={isUpdatingPresence}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogIn className="btn-icon" />
                {isUpdatingPresence ? 'Checking In...' : 'Check In'}
              </button>
            )}
            
            <button className="btn btn-primary" onClick={handleEdit}>
              <Edit className="btn-icon" />
              {t('patients.editPatient')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Information Grid */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        {/* Basic Information Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserCircle style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('detail.basicInfo')}</h3>
            </div>
          </div>
          <div className="info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="info-item">
              <span className="info-label">{t('patients.fullName')}</span>
              <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', direction: 'rtl', textAlign: 'right' }}>
                {patient.fullNameArabic || 'No Name'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('patients.patientCode')}</span>
              <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-blue)' }}>{patient.code}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value" style={{ fontSize: '1.1rem' }}>
                {(patient as any).dateOfBirth 
                  ? new Date((patient as any).dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'N/A'}
                {(patient as any).dateOfBirth && (
                  <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
                    ({(() => {
                      const dob = new Date((patient as any).dateOfBirth);
                      const today = new Date();
                      let years = today.getFullYear() - dob.getFullYear();
                      let months = today.getMonth() - dob.getMonth();
                      if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
                        years--;
                        months += 12;
                      }
                      if (years > 0) {
                        return months > 0 ? `${years}y ${months}m` : `${years} years`;
                      } else {
                        const days = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
                        return months > 0 ? `${months} months` : `${days} days`;
                      }
                    })()})
                  </span>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('patients.gender')}</span>
              <span className="info-value" style={{ fontSize: '1.1rem' }}>{patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')}</span>
            </div>
            {(patient as any).weight && (
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{(patient as any).weight} kg</span>
              </div>
            )}
            {(patient as any).clinicBranch && (
              <div className="info-item">
                <span className="info-label">Clinic Branch</span>
                <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{(patient as any).clinicBranch}</span>
              </div>
            )}
            {(patient as any).referringDoctor && (
              <div className="info-item">
                <span className="info-label">Referring Doctor</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{(patient as any).referringDoctor}</span>
              </div>
            )}
            {((patient as any).governorate || (patient as any).city) && (
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>
                  {(patient as any).city && (patient as any).governorate 
                    ? `${(patient as any).city}, ${(patient as any).governorate}`
                    : (patient as any).city || (patient as any).governorate}
                </span>
              </div>
            )}
            <div className="info-item" style={{ gridColumn: 'span 2' }}>
              <span className="info-label">{t('patients.diagnosis')}</span>
              <span className="info-value" style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: 'var(--primary-blue)',
                padding: '0.75rem',
                background: 'rgba(58, 175, 169, 0.1)',
                borderRadius: '8px',
                display: 'inline-block',
                marginTop: '0.5rem'
              }}>
                {patient.diagnosis}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('patients.visitedDate')}</span>
              <span className="info-value" style={{ fontSize: '1rem' }}>
                {new Date(patient.visitedDate || (patient as any).admissionDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('patients.status')}</span>
              <span className={`status-badge status-${patient.status.toLowerCase().replace('-', '-')}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                {patient.status === 'Diagnosed' ? t('status.diagnosed') : patient.status === 'Pre-op' ? t('status.preOp') : t('status.postOp')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>{t('detail.quickStats') || 'Quick Stats'}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(58, 175, 169, 0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)', marginBottom: '0.25rem' }}>
                {t('detail.surgeriesCount') || 'Surgeries'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                {patient.surgeries?.length || 0}
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(58, 175, 169, 0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)', marginBottom: '0.25rem' }}>
                {t('detail.followUpsCount') || 'Follow-ups'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                {patient.followUps?.length || 0}
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(58, 175, 169, 0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)', marginBottom: '0.25rem' }}>
                {t('detail.filesCount') || 'Files'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                {(patient.files?.radiology?.length || 0) + (patient.files?.lab?.length || 0) + (patient.files?.personalImage ? 1 : 0) + (patient.files?.surgeryImage ? 1 : 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Notes Card */}
      {patient.notes && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('detail.medicalNotes')}</h3>
            </div>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            background: 'var(--light)', 
            borderRadius: '12px', 
            lineHeight: '1.8',
            border: '1px solid rgba(58, 175, 169, 0.2)'
          }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--dark)', fontSize: '1rem' }}>{patient.notes}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      {patient.contactInfo && (patient.contactInfo.name || patient.contactInfo.phone) && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Phone style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('detail.contactInfo')}</h3>
            </div>
          </div>
          <div className="info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {patient.contactInfo.name && (
              <div className="info-item">
                <span className="info-label">{t('form.contactName')}</span>
                <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.contactInfo.name}</span>
              </div>
            )}
            {patient.contactInfo.relation && (
              <div className="info-item">
                <span className="info-label">{t('form.relation')}</span>
                <span className="info-value" style={{ fontSize: '1rem' }}>{patient.contactInfo.relation}</span>
              </div>
            )}
            {patient.contactInfo.phone && (
              <div className="info-item">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  {t('form.phone')}
                </span>
                <a 
                  href={`tel:${patient.contactInfo.phone}`}
                  className="info-value" 
                  style={{ 
                    fontSize: '1.1rem',
                    fontWeight: '600', 
                    color: 'var(--primary-blue)',
                    textDecoration: 'none'
                  }}
                >
                  {patient.contactInfo.phone}
                </a>
              </div>
            )}
            {patient.contactInfo.email && (
              <div className="info-item">
                <span className="info-label">{t('form.email')}</span>
                <a 
                  href={`mailto:${patient.contactInfo.email}`}
                  className="info-value" 
                  style={{ 
                    fontSize: '1rem',
                    color: 'var(--primary-blue)',
                    textDecoration: 'none'
                  }}
                >
                  {patient.contactInfo.email}
                </a>
              </div>
            )}
            {patient.contactInfo.address && (
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">{t('form.address')}</span>
                <span className="info-value" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{patient.contactInfo.address}</span>
              </div>
            )}
            {(patient as any).governorate && (
              <div className="info-item">
                <span className="info-label">Governorate / المحافظة</span>
                <span className="info-value" style={{ fontSize: '1rem' }}>{(patient as any).governorate}</span>
              </div>
            )}
            {(patient as any).city && (
              <div className="info-item">
                <span className="info-label">City / المدينة</span>
                <span className="info-value" style={{ fontSize: '1rem' }}>{(patient as any).city}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planned Surgery */}
      {(patient as any).plannedSurgery && ((patient as any).plannedSurgery.operation || (patient as any).plannedSurgery.estimatedCost) && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #ffc107', background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%)' }}>
          <div className="card-header" style={{ borderBottom: '2px solid rgba(255, 193, 7, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: '#ffc107',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>Planned Surgery</h3>
            </div>
          </div>
          <div className="info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', padding: '1.5rem' }}>
            {(patient as any).plannedSurgery.operationCategory && (
              <div className="info-item">
                <span className="info-label">Operation Category</span>
                <span className="info-value" style={{ fontSize: '1rem' }}>{(patient as any).plannedSurgery.operationCategory}</span>
              </div>
            )}
            {(patient as any).plannedSurgery.operation && (
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Planned Operation</span>
                <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f57c00' }}>
                  {(patient as any).plannedSurgery.operation}
                </span>
              </div>
            )}
            {(patient as any).plannedSurgery.estimatedCost && state.currentUser && (state.currentUser.role === 'admin' || state.currentUser.canViewFinancial) && (
              <div className="info-item">
                <span className="info-label">Estimated Cost</span>
                <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-blue)' }}>
                  {(patient as any).plannedSurgery.estimatedCost} {(patient as any).plannedSurgery.costCurrency || 'EGP'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Surgery Details */}
      {patient.surgeries && patient.surgeries.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('detail.surgeryDetails')}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {patient.surgeries.map((surgery, index) => (
            <div 
              key={index} 
              style={{ 
                background: 'var(--light)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid rgba(58, 175, 169, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(58, 175, 169, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 175, 169, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid rgba(58, 175, 169, 0.2)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary-blue)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {index + 1}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--dark)' }}>
                  {surgery.type || t('detail.surgery') + ' ' + (index + 1)}
                </h4>
              </div>
              <div className="info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="info-item">
                  <span className="info-label">{t('detail.surgeryDate')}</span>
                  <span className="info-value" style={{ fontSize: '1rem', fontWeight: '500' }}>
                    {new Date(surgery.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {(surgery as any).operation && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label">Operation</span>
                    <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-dark)' }}>
                      {(surgery as any).operation}
                    </span>
                  </div>
                )}
                {surgery.cost && state.currentUser && (state.currentUser.role === 'admin' || state.currentUser.canViewFinancial) && (
                  <div className="info-item">
                    <span className="info-label">{t('detail.cost')}</span>
                    <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-blue)' }}>
                      {surgery.cost} {surgery.costCurrency || 'EGP'}
                    </span>
                  </div>
                )}
                {surgery.surgeons && surgery.surgeons.length > 0 && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label" style={{ marginBottom: '0.75rem', display: 'block' }}>{t('form.surgeons')}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {surgery.surgeons.map((surgeon, idx) => (
                        <div key={idx} style={{ 
                          padding: '1rem', 
                          background: 'var(--white)', 
                          borderRadius: '8px',
                          border: '1px solid rgba(58, 175, 169, 0.2)'
                        }}>
                          <div style={{ fontWeight: '600', color: 'var(--dark)', marginBottom: '0.25rem' }}>{surgeon.name}</div>
                          {surgeon.specialization && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)', marginBottom: '0.25rem' }}>
                              {surgeon.specialization}
                            </div>
                          )}
                          {surgeon.phone && (
                            <a 
                              href={`tel:${surgeon.phone}`}
                              style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', textDecoration: 'none' }}
                            >
                              {surgeon.phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {surgery.notes && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label">{t('form.notes')}</span>
                    <div style={{ 
                      marginTop: '0.5rem',
                      padding: '1rem', 
                      background: 'var(--white)', 
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap', 
                      lineHeight: '1.6',
                      color: 'var(--dark)'
                    }}>
                      {surgery.notes}
                    </div>
                  </div>
                )}
                {(surgery as any).photos && (surgery as any).photos.length > 0 && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label">Surgery Photos</span>
                    <div style={{ 
                      marginTop: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '1rem'
                    }}>
                      {(surgery as any).photos.map((photoUrl: string, photoIndex: number) => (
                        <div key={photoIndex} style={{
                          position: 'relative',
                          paddingTop: '100%',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }}
                        onClick={() => window.open(photoUrl, '_blank')}>
                          <img
                            src={photoUrl}
                            alt={`Surgery ${index + 1} Photo ${photoIndex + 1}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {patient.followUps && patient.followUps.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(58, 175, 169, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('form.followUps')}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patient.followUps.map((followUp, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '1.5rem',
                background: 'var(--light)',
                borderRadius: '12px',
                border: '2px solid rgba(58, 175, 169, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(58, 175, 169, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 175, 169, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-blue)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    #{followUp.number}
                  </div>
                  <h4 style={{ margin: 0, color: 'var(--dark)', fontSize: '1.1rem', fontWeight: '600' }}>
                    {t('detail.followUp')} {followUp.number}
                  </h4>
                </div>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--secondary-gray)',
                  padding: '0.5rem 1rem',
                  background: 'var(--white)',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}>
                  {new Date(followUp.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {followUp.notes && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'var(--white)', 
                  borderRadius: '8px',
                  color: 'var(--dark)', 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.8',
                  fontSize: '0.95rem',
                  marginBottom: '1rem'
                }}>
                  {followUp.notes}
                </div>
              )}
              {(followUp as any).photos && (followUp as any).photos.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)', marginBottom: '0.75rem', fontWeight: '600' }}>
                    Follow-up Photos
                  </div>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {(followUp as any).photos.map((photoUrl: string, photoIndex: number) => (
                      <div key={photoIndex} style={{
                        position: 'relative',
                        paddingTop: '100%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                      }}
                      onClick={() => window.open(photoUrl, '_blank')}>
                        <img
                          src={photoUrl}
                          alt={`Follow-up ${followUp.number} Photo ${photoIndex + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Medical Files & Images */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'rgba(58, 175, 169, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ImageIcon style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
            </div>
            <h3 className="card-title" style={{ margin: 0 }}>{t('detail.filesAndImages')}</h3>
          </div>
        </div>
        {(patient.files?.personalImage || patient.files?.surgeryImage || patient.files?.radiology?.length || patient.files?.lab?.length) ? (
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {patient.files.personalImage && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem', 
                border: '2px solid rgba(58, 175, 169, 0.2)', 
                borderRadius: '12px', 
                background: 'var(--light)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-blue)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(58, 175, 169, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 175, 169, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <h4 style={{ marginBottom: '1rem', color: 'var(--dark)', fontWeight: '600' }}>{t('detail.personalImage')}</h4>
                <img 
                  src={patient.files!.personalImage!} 
                  alt="Personal" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    border: '2px solid rgba(58, 175, 169, 0.3)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }} 
                  onClick={() => window.open(patient.files!.personalImage!, '_blank')} 
                />
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--secondary-gray)' }}>{t('detail.viewFullSize')}</p>
              </div>
            )}
            {patient.files.surgeryImage && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem', 
                border: '2px solid rgba(58, 175, 169, 0.2)', 
                borderRadius: '12px', 
                background: 'var(--light)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-blue)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(58, 175, 169, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 175, 169, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <h4 style={{ marginBottom: '1rem', color: 'var(--dark)', fontWeight: '600' }}>{t('detail.surgeryImage')}</h4>
                <img 
                  src={patient.files!.surgeryImage!} 
                  alt="Surgery" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    border: '2px solid rgba(58, 175, 169, 0.3)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }} 
                  onClick={() => window.open(patient.files!.surgeryImage!, '_blank')} 
                />
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--secondary-gray)' }}>{t('detail.viewFullSize')}</p>
              </div>
            )}
            {patient.files.radiology && patient.files.radiology.length > 0 && (
              <div style={{ 
                padding: '1.5rem', 
                background: 'var(--light)', 
                borderRadius: '12px', 
                border: '2px solid rgba(58, 175, 169, 0.2)'
              }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--dark)', fontWeight: '600' }}>{t('detail.radiologyFiles')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {patient.files.radiology.map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary" 
                      style={{ 
                        textDecoration: 'none',
                        justifyContent: 'center'
                      }}
                    >
                      {t('detail.viewRadiology') || 'View'} {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {patient.files.lab && patient.files.lab.length > 0 && (
              <div style={{ 
                padding: '1.5rem', 
                background: 'var(--light)', 
                borderRadius: '12px', 
                border: '2px solid rgba(58, 175, 169, 0.2)'
              }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--dark)', fontWeight: '600' }}>{t('detail.labFiles')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {patient.files.lab.map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary" 
                      style={{ 
                        textDecoration: 'none',
                        justifyContent: 'center'
                      }}
                    >
                      {t('detail.viewLabFile') || 'View'} {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            color: 'var(--secondary-gray)', 
            background: 'var(--light)', 
            borderRadius: '12px',
            border: '2px dashed rgba(58, 175, 169, 0.3)'
          }}>
            <FileText style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.4, color: 'var(--primary-blue)' }} />
            <p style={{ margin: 0, fontSize: '1rem' }}>{t('detail.noFiles')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
