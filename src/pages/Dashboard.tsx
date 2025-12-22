import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { DashboardStats } from '../types';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';

const Dashboard: React.FC = () => {
  const { state } = usePatientContext();
  const { t } = useLanguage();

  const stats: DashboardStats = useMemo(() => {
    const patients = state.patients;
    const totalPatients = patients.length;
    const diagnosedPatients = patients.filter(p => p.status === 'Diagnosed').length;
    const preOpPatients = patients.filter(p => p.status === 'Pre-op').length;
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
      postOpPatients,
      patientsByDiagnosis,
      monthlyVisits,
    };
  }, [state.patients]);

  const quickActions = [
    {
      title: t('dashboard.viewAllPatients'),
      description: t('dashboard.viewAllPatientsDesc'),
      icon: Users,
      link: '/patients',
      color: 'var(--primary-blue)',
    },
    {
      title: t('dashboard.viewStatistics'),
      description: t('dashboard.viewStatisticsDesc'),
      icon: TrendingUp,
      link: '/statistics',
      color: 'var(--info)',
    },
    {
      title: t('dashboard.adminPanel'),
      description: t('dashboard.adminPanelDesc'),
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
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">{t('dashboard.title')}</h1>
          <p className="dashboard-subtitle">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleExportDashboardPDF}>
            <Download className="btn-icon" />
            {t('dashboard.exportPDF')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4">
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
      </div>

      <div className="grid grid-2">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.quickActions')}</h2>
          </div>
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="quick-action-item"
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className="quick-action-icon">
                  <action.icon className="icon" />
                </div>
                <div className="quick-action-content">
                  <h3 className="quick-action-title">{action.title}</h3>
                  <p className="quick-action-description">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.recentPatients')}</h2>
            <Link to="/patients" className="btn btn-sm btn-secondary">
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="recent-patients">
            {recentPatients.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <p>{t('common.noData')}</p>
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="recent-patient-item">
                  <div className="patient-info">
                    <h4 className="patient-name" style={{ direction: 'rtl', textAlign: 'right' }}>{patient.fullNameArabic || 'No Name'}</h4>
                    <p className="patient-details">
                      {patient.diagnosis} • {patient.age} {t('patients.yearsOld')}
                    </p>
                  </div>
                  <div className="patient-status">
                    <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                      {patient.status === 'Diagnosed' ? t('status.diagnosed') : patient.status === 'Pre-op' ? t('status.preOp') : t('status.postOp')}
                    </span>
                  </div>
                </div>
              ))
            )}
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
