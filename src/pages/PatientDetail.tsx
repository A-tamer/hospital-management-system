import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, User, Heart, FileText, Image as ImageIcon, UserCircle, Download } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useToast } from '../components/Toast';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = usePatientContext();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
                  {patient.status === 'Diagnosed' ? t('status.diagnosed') : patient.status === 'Pre-op' ? t('status.preOp') : t('status.postOp')}
                </span>
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
              <span className="info-label">{t('patients.age')}</span>
              <span className="info-value" style={{ fontSize: '1.1rem' }}>{patient.age} {t('stats.years')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('patients.gender')}</span>
              <span className="info-value" style={{ fontSize: '1.1rem' }}>{patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')}</span>
            </div>
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
                {surgery.cost && state.currentUser && (state.currentUser.role === 'admin' || state.currentUser.canViewFinancial) && (
                  <div className="info-item">
                    <span className="info-label">{t('detail.cost')}</span>
                    <span className="info-value" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-blue)' }}>
                      {surgery.cost} {surgery.costCurrency || 'USD'}
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
                  fontSize: '0.95rem'
                }}>
                  {followUp.notes}
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
