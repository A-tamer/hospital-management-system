import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  UserCheck,
  Scissors
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { DashboardStats } from '../types';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';

const Dashboard: React.FC = () => {
  const { state } = usePatientContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats: DashboardStats = useMemo(() => {
    const patients = state.patients;
    const totalPatients = patients.length;
    const diagnosedPatients = patients.filter(p => p.status === 'Diagnosed').length;
    const preOpPatients = patients.filter(p => p.status === 'Pre-op').length;
    const opPatients = patients.filter(p => p.status === 'Op').length;
    const postOpPatients = patients.filter(p => p.status === 'Post-op').length;

    // Group by diagnosis
    const patientsByDiagnosis = patients.reduce((acc, patient) => {
      acc[patient.diagnosis] = (acc[patient.diagnosis] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Group by month (using visitedDate)
    const monthlyVisits = patients.reduce((acc, patient) => {
      const dateField = patient.visitedDate || (patient as any).admissionDate;
      if (dateField) {
        const month = new Date(dateField).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalPatients,
      diagnosedPatients,
      preOpPatients,
      opPatients,
      postOpPatients,
      patientsByDiagnosis,
      monthlyVisits,
    };
  }, [state.patients]);

  // Calculate present patients separately for display
  const presentPatients = useMemo(() => 
    state.patients.filter(p => (p as any).presentAtClinic === true).length,
    [state.patients]
  );

  const quickActions = [
    {
      title: 'Present Patients',
      description: `${presentPatients}`,
      icon: UserCheck,
      action: () => {
        navigate('/patients', { state: { showPresentOnly: true } });
      },
      color: '#28a745',
      badge: presentPatients,
    },
    {
      title: 'Op Patients',
      description: `${stats.opPatients}`,
      icon: Scissors,
      action: () => {
        navigate('/patients', { state: { filterStatus: 'Op' } });
      },
      color: '#ff6b6b',
      badge: stats.opPatients,
    },
    {
      title: t('dashboard.viewStatistics'),
      description: 'Analytics',
      icon: TrendingUp,
      link: '/statistics',
      color: 'var(--info)',
    },
    {
      title: t('dashboard.adminPanel'),
      description: 'Settings',
      icon: FileText,
      link: '/admin',
      color: 'var(--secondary-blue)',
    },
  ];

  const recentPatients = state.patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleExportDashboardPDF = () => {
    generatePDFReport.dashboard(state.patients, stats, 'Hospital Dashboard Report');
  };

  return (
    <div className="dashboard fade-in" style={{ padding: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Surgicare Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to Surgicare Clinics. Manage your Cairo and Mansoura clinic operations, track patient records, and streamline surgical care.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleExportDashboardPDF}>
            <Download className="btn-icon" />
            {t('dashboard.exportPDF')}
          </button>
        </div>
      </div>

      {/* Quick Actions - Square Cards Horizontally */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%'
      }}>
        {quickActions.map((action, index) => {
          const baseStyle = {
            background: action.color,
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            textAlign: 'center' as const,
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
            width: '170px',
            height: '170px',
            flex: '0 0 170px'
          };

          const content = (
            <>
              <action.icon style={{ width: '48px', height: '48px', marginBottom: '0.75rem', opacity: 0.95 }} />
              {action.badge !== undefined && (
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1' }}>
                  {action.badge}
                </div>
              )}
              <div style={{ fontSize: '0.875rem', fontWeight: '600', opacity: 0.95, lineHeight: '1.3' }}>
                {action.title}
              </div>
            </>
          );
          
          if (action.action) {
            return (
              <div
                key={index}
                onClick={action.action}
                style={{ ...baseStyle, cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                }}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={index}
              to={action.link || '#'}
              style={baseStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.02)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
              }}
            >
              {content}
            </Link>
          );
        })}
      </div>

      {/* Recent Patients & Quick Stats */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Recent Patients */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ 
            padding: '1.5rem 1.5rem 1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e9ecef'
          }}>
            <h2 style={{ 
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#17a2b8'
            }}>
              Recent Patients
            </h2>
            <Link to="/patients" className="btn btn-sm btn-secondary" style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #17a2b8',
              background: 'white',
              color: '#17a2b8',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              View All
            </Link>
          </div>
          <div style={{ padding: '1rem' }}>
            {recentPatients.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <p>{t('dashboard.noRecentPatients')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentPatients.map((patient) => {
                  // Calculate age display
                  let ageDisplay = '';
                  if ((patient as any).dateOfBirth) {
                    const dob = new Date((patient as any).dateOfBirth);
                    const today = new Date();
                    let years = today.getFullYear() - dob.getFullYear();
                    let months = today.getMonth() - dob.getMonth();
                    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
                      years--;
                      months += 12;
                    }
                    if (years > 0) {
                      ageDisplay = `${years} years old`;
                    } else {
                      const days = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
                      ageDisplay = months > 0 ? `${months} months old` : `${days} days old`;
                    }
                  } else if (patient.age) {
                    ageDisplay = `${Math.floor(patient.age)} years old`;
                  }

                  return (
                    <Link
                      key={patient.id}
                      to={`/patient/${patient.id}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem',
                        background: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#17a2b8';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(23, 162, 184, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#dee2e6';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#17a2b8',
                          direction: 'rtl',
                          textAlign: 'right'
                        }}>
                          {patient.fullNameArabic || 'No Name'}
                        </h3>
                        <p style={{ 
                          margin: 0,
                          fontSize: '0.95rem',
                          color: '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {patient.diagnosis || 'Undiagnosed'} • {ageDisplay}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: patient.status === 'Diagnosed' ? '#e7f3ff' :
                                   patient.status === 'Pre-op' ? '#fff4e6' :
                                   patient.status === 'Op' ? '#ffe6e6' :
                                   '#e8f5e9',
                        color: patient.status === 'Diagnosed' ? '#0066cc' :
                               patient.status === 'Pre-op' ? '#ff9800' :
                               patient.status === 'Op' ? '#f44336' :
                               '#4caf50'
                      }}>
                        {patient.status === 'Diagnosed' ? 'DIAGNOSED' : 
                         patient.status === 'Pre-op' ? 'PRE-OP' : 
                         patient.status === 'Op' ? 'OP' :
                         'POST-OP'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Stats</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{stats.totalPatients}</div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>Total Patients</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>{presentPatients}</div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>Present</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{stats.preOpPatients}</div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>Pre-Op</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>{stats.opPatients}</div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>Op</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card stats-card">
          <div className="stats-icon">
            <Users className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.totalPatients}</div>
            <div className="stats-label">{t('dashboard.totalPatients')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Activity className="icon" style={{ color: 'var(--success)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.diagnosedPatients}</div>
            <div className="stats-label">{t('dashboard.diagnosed')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <CheckCircle className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.preOpPatients}</div>
            <div className="stats-label">{t('dashboard.preOp')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <AlertCircle className="icon" style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.postOpPatients}</div>
            <div className="stats-label">{t('dashboard.postOp')}</div>
          </div>
        </div>
        
        <div className="card stats-card" style={{ background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)' }}>
          <div className="stats-icon">
            <Users className="icon" style={{ color: '#28a745' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number" style={{ color: '#28a745' }}>{presentPatients}</div>
            <div className="stats-label">Present at Clinic</div>
          </div>
        </div>
      </div>

      {/* Diagnosis Distribution */}
      {Object.keys(stats.patientsByDiagnosis).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.diagnosisDistribution')}</h2>
          </div>
          <div className="diagnosis-grid">
            {Object.entries(stats.patientsByDiagnosis).map(([diagnosis, count]) => (
              <div key={diagnosis} className="diagnosis-item">
                <div className="diagnosis-name">{diagnosis}</div>
                <div className="diagnosis-count">{count} patients</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
