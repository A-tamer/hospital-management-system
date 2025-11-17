import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, User, Heart, FileText, Image as ImageIcon, UserCircle } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = usePatientContext();

  const patient = state.patients.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="patients-page fade-in">
        <div className="card">
          <div className="empty-state">
            <User className="empty-icon" />
            <p>Patient not found</p>
            <button className="btn btn-primary" onClick={() => navigate('/patients')}>
              <ArrowLeft className="btn-icon" />
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/patients`, { state: { editPatientId: patient.id } });
  };

  return (
    <div className="patients-page fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title-section">
          <button className="btn btn-secondary" onClick={() => navigate('/patients')} style={{ marginBottom: '1rem' }}>
            <ArrowLeft className="btn-icon" />
            Back to Patients
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {patient.photoUrl && (
              <img 
                src={patient.photoUrl} 
                alt={patient.fullName}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #007bff'
                }}
              />
            )}
            <div>
              <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{patient.fullName}</h1>
              <p className="page-subtitle" style={{ margin: 0 }}>Patient Code: {patient.code}</p>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleEdit}>
            <Edit className="btn-icon" />
            Edit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Basic Information Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <UserCircle style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#007bff' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Basic Information</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{patient.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{patient.age} years</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{patient.gender}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Diagnosis</span>
              <span className="info-value" style={{ fontWeight: '600', color: '#007bff' }}>{patient.diagnosis}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                {patient.status}
              </span>
            </div>
          </div>
        </div>

        {/* Dates Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <Calendar style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#28a745' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Dates</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Admission Date</span>
              <span className="info-value">
                {new Date(patient.admissionDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            {patient.dischargeDate && (
              <div className="info-item">
                <span className="info-label">Discharge Date</span>
                <span className="info-value">
                  {new Date(patient.dischargeDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Notes Card */}
      {patient.notes && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <FileText style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#17a2b8' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Medical Notes</h3>
          </div>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px', lineHeight: '1.6' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{patient.notes}</p>
          </div>
        </div>
      )}

      {/* Parents Information */}
      {patient.parents && (patient.parents.fatherName || patient.parents.motherName) && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <User style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#ffc107' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Parents Information</h3>
          </div>
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {patient.parents.fatherName && (
              <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1rem', fontWeight: '600' }}>Father</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{patient.parents.fatherName}</span>
                  </div>
                  {patient.parents.fatherPhone && (
                    <div className="info-item">
                      <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        Phone
                      </span>
                      <span className="info-value">{patient.parents.fatherPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {patient.parents.motherName && (
              <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1rem', fontWeight: '600' }}>Mother</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{patient.parents.motherName}</span>
                  </div>
                  {patient.parents.motherPhone && (
                    <div className="info-item">
                      <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        Phone
                      </span>
                      <span className="info-value">{patient.parents.motherPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <Phone style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#dc3545' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Emergency Contact</h3>
          </div>
          <div className="info-grid" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value" style={{ fontWeight: '600' }}>{patient.emergencyContact.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Relation</span>
              <span className="info-value">{patient.emergencyContact.relation}</span>
            </div>
            <div className="info-item">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                Phone
              </span>
              <span className="info-value" style={{ fontWeight: '600', color: '#007bff' }}>{patient.emergencyContact.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Surgery Details */}
      {patient.surgeries && patient.surgeries.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <Heart style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#e83e8c' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Surgery Details</h3>
          </div>
          {patient.surgeries.map((surgery, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: index < patient.surgeries!.length - 1 ? '1.5rem' : 0, 
                paddingBottom: index < patient.surgeries!.length - 1 ? '1.5rem' : 0, 
                borderBottom: index < patient.surgeries!.length - 1 ? '1px solid #e0e0e0' : 'none',
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px'
              }}
            >
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Surgery Date</span>
                  <span className="info-value">
                    {new Date(surgery.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Surgery Type</span>
                  <span className="info-value" style={{ fontWeight: '600', color: '#007bff' }}>{surgery.type}</span>
                </div>
                {surgery.surgeon && (
                  <div className="info-item">
                    <span className="info-label">Surgeon</span>
                    <span className="info-value">{surgery.surgeon}</span>
                  </div>
                )}
                {surgery.notes && (
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="info-label">Notes</span>
                    <span className="info-value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{surgery.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medical Files & Images */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
          <ImageIcon style={{ width: '24px', height: '24px', marginRight: '0.5rem', color: '#17a2b8' }} />
          <h3 className="card-title" style={{ margin: 0 }}>Medical Files & Images</h3>
        </div>
        {(patient.xrayUrl || patient.medicalFileUrl) ? (
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {patient.xrayUrl && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                background: '#f8f9fa',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.background = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#f8f9fa';
              }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#333' }}>X-ray Image</h4>
                <img 
                  src={patient.xrayUrl} 
                  alt="X-ray"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #ddd'
                  }}
                  onClick={() => window.open(patient.xrayUrl, '_blank')}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Click to view full size</p>
              </div>
            )}
            {patient.medicalFileUrl && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                background: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.background = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#f8f9fa';
              }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#333' }}>Medical File</h4>
                <FileText style={{ width: '64px', height: '64px', color: '#007bff', marginBottom: '1rem' }} />
                <a 
                  href={patient.medicalFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View/Download File
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999', background: '#f8f9fa', borderRadius: '8px' }}>
            <FileText style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No medical files or images uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
