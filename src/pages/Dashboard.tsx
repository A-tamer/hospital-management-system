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

const Dashboard: React.FC = () => {
  const { state } = usePatientContext();

  const stats: DashboardStats = useMemo(() => {
    const patients = state.patients;
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'Active').length;
    const recoveredPatients = patients.filter(p => p.status === 'Recovered').length;
    const inactivePatients = patients.filter(p => p.status === 'Inactive').length;

    // Group by diagnosis
    const patientsByDiagnosis = patients.reduce((acc, patient) => {
      acc[patient.diagnosis] = (acc[patient.diagnosis] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Group by month
    const monthlyAdmissions = patients.reduce((acc, patient) => {
      const month = new Date(patient.admissionDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalPatients,
      activePatients,
      recoveredPatients,
      inactivePatients,
      patientsByDiagnosis,
      monthlyAdmissions,
    };
  }, [state.patients]);

  const quickActions = [
    {
      title: 'View All Patients',
      description: 'Browse and manage patient records',
      icon: Users,
      link: '/patients',
      color: 'var(--primary-teal)',
    },
    {
      title: 'View Statistics',
      description: 'Analyze patient data and trends',
      icon: TrendingUp,
      link: '/statistics',
      color: 'var(--primary-purple)',
    },
    {
      title: 'Admin Panel',
      description: 'Manage users and system settings',
      icon: FileText,
      link: '/admin',
      color: 'var(--primary-sky)',
    },
  ];

  const recentPatients = state.patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleExportDashboardPDF = () => {
    generatePDFReport.dashboard(state.patients, stats, 'Hospital Dashboard Report');
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Hospital Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to the Hospital Management System. Monitor key metrics and manage patient records.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleExportDashboardPDF}>
            <Download className="btn-icon" />
            Export Dashboard PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4">
        <div className="card stats-card">
          <div className="stats-icon">
            <Users className="icon" style={{ color: 'var(--primary-teal)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.totalPatients}</div>
            <div className="stats-label">Total Patients</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Activity className="icon" style={{ color: 'var(--success)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.activePatients}</div>
            <div className="stats-label">Active Cases</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <CheckCircle className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.recoveredPatients}</div>
            <div className="stats-label">Recovered</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <AlertCircle className="icon" style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{stats.inactivePatients}</div>
            <div className="stats-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
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
            <h2 className="card-title">Recent Patients</h2>
            <Link to="/patients" className="btn btn-sm btn-secondary">
              View All
            </Link>
          </div>
          <div className="recent-patients">
            {recentPatients.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <p>No patients found. Add your first patient to get started.</p>
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="recent-patient-item">
                  <div className="patient-info">
                    <h4 className="patient-name">{patient.fullName}</h4>
                    <p className="patient-details">
                      {patient.diagnosis} • {patient.age} years old
                    </p>
                  </div>
                  <div className="patient-status">
                    <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                      {patient.status}
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
            <h2 className="card-title">Diagnosis Distribution</h2>
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
