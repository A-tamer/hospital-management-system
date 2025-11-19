import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { generatePDFReport } from '../utils/pdfGenerator';
import { DashboardStats } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Statistics: React.FC = () => {
  const { state } = usePatientContext();
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    const patients = state.patients;

    // Diagnosis distribution
    const diagnosisData = patients.reduce((acc, patient) => {
      acc[patient.diagnosis] = (acc[patient.diagnosis] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Status distribution
    const statusData = patients.reduce((acc, patient) => {
      acc[patient.status] = (acc[patient.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Monthly admissions (last 12 months)
    const monthlyData = patients.reduce((acc, patient) => {
      const dateField = patient.visitedDate || (patient as any).admissionDate;
      if (!dateField) return acc;
      const date = new Date(dateField);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Generate last 12 months
    const last12Months: Array<{key: string, label: string, count: number}> = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last12Months.push({
        key: monthKey,
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthlyData[monthKey] || 0,
      });
    }

    // Age distribution
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0,
    };

    patients.forEach(patient => {
      const age = patient.age;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });

    return {
      diagnosisData,
      statusData,
      monthlyData: last12Months,
      ageGroups,
    };
  }, [state.patients]);

  const diagnosisChartData = {
    labels: Object.keys(chartData.diagnosisData),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(chartData.diagnosisData),
        backgroundColor: [
          '#14b8a6',
          '#8b5cf6',
          '#0ea5e9',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#84cc16',
        ],
        borderColor: [
          '#0f766e',
          '#7c3aed',
          '#0284c7',
          '#2563eb',
          '#059669',
          '#d97706',
          '#dc2626',
          '#65a30d',
        ],
        borderWidth: 2,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(chartData.statusData),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(chartData.statusData),
        backgroundColor: [
          '#10b981', // Active - Green
          '#3b82f6', // Recovered - Blue
          '#f59e0b', // Inactive - Yellow
        ],
        borderColor: [
          '#059669',
          '#2563eb',
          '#d97706',
        ],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: chartData.monthlyData.map(item => item.label),
    datasets: [
      {
        label: 'Monthly Admissions',
        data: chartData.monthlyData.map(item => item.count),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ageChartData = {
    labels: Object.keys(chartData.ageGroups),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(chartData.ageGroups),
        backgroundColor: [
          '#14b8a6',
          '#8b5cf6',
          '#0ea5e9',
          '#3b82f6',
          '#10b981',
        ],
        borderColor: [
          '#0f766e',
          '#7c3aed',
          '#0284c7',
          '#2563eb',
          '#059669',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#14b8a6',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          color: '#64748b',
        },
      },
      x: {
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          color: '#64748b',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#14b8a6',
      },
    },
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state.patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hospital-patients-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const statsData: DashboardStats = {
      totalPatients: state.patients.length,
      diagnosedPatients: state.patients.filter(p => p.status === 'Diagnosed').length,
      preOpPatients: state.patients.filter(p => p.status === 'Pre-op').length,
      postOpPatients: state.patients.filter(p => p.status === 'Post-op').length,
      patientsByDiagnosis: chartData.diagnosisData,
      monthlyVisits: chartData.monthlyData.reduce((acc, item) => {
        acc[item.label] = item.count;
        return acc;
      }, {} as { [key: string]: number }),
    };
    
    generatePDFReport.statistics(statsData, 'Hospital Statistics Report');
  };

  return (
    <div className="statistics-page fade-in" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">{t('stats.title')}</h1>
          <p className="page-subtitle">{t('stats.subtitle')}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportData}>
            <Download className="btn-icon" />
            {t('stats.exportJSON')}
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download className="btn-icon" />
            {t('stats.exportPDF')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4">
        <div className="card stats-card">
          <div className="stats-icon">
            <Users className="icon" style={{ color: 'var(--primary-teal)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{state.patients.length}</div>
            <div className="stats-label">{t('stats.totalPatients')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Activity className="icon" style={{ color: 'var(--success)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {Object.values(chartData.statusData).reduce((a, b) => a + b, 0) - (chartData.statusData['Recovered'] || 0)}
            </div>
            <div className="stats-label">{t('stats.activeCases')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <TrendingUp className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {chartData.monthlyData[chartData.monthlyData.length - 1]?.count || 0}
            </div>
            <div className="stats-label">{t('stats.thisMonth')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Calendar className="icon" style={{ color: 'var(--primary-purple)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {Object.keys(chartData.diagnosisData).length}
            </div>
            <div className="stats-label">{t('stats.diagnoses')}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-2">
        {/* Diagnosis Distribution - Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <BarChart3 className="card-title-icon" />
              {t('stats.diagnosisDistribution')}
            </h2>
          </div>
          <div className="chart-container">
            <Bar data={diagnosisChartData} options={chartOptions} />
          </div>
        </div>

        {/* Status Distribution - Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <PieChart className="card-title-icon" />
              {t('stats.patientStatus')}
            </h2>
          </div>
          <div className="chart-container">
            <Pie data={statusChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Monthly Trends - Line Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp className="card-title-icon" />
              {t('stats.monthlyTrends')}
            </h2>
          </div>
          <div className="chart-container">
            <Line data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Age Distribution - Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Users className="card-title-icon" />
              {t('stats.ageDistribution')}
            </h2>
          </div>
          <div className="chart-container">
            <Bar data={ageChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('stats.detailedStats')}</h2>
        </div>
        <div className="stats-table">
          <div className="stats-table-row">
            <div className="stats-table-label">{t('stats.mostCommonDiagnosis')}</div>
            <div className="stats-table-value">
              {Object.entries(chartData.diagnosisData).reduce((a, b) => 
                chartData.diagnosisData[a[0]] > chartData.diagnosisData[b[0]] ? a : b, 
                ['None', 0]
              )[0]}
            </div>
          </div>
          <div className="stats-table-row">
            <div className="stats-table-label">{t('stats.averageAge')}</div>
            <div className="stats-table-value">
              {state.patients.length > 0 
                ? Math.round(state.patients.reduce((sum, p) => sum + p.age, 0) / state.patients.length)
                : 0} {t('stats.years')}
            </div>
          </div>
          <div className="stats-table-row">
            <div className="stats-table-label">{t('stats.recoveryRate')}</div>
            <div className="stats-table-value">
              {state.patients.length > 0 
                ? Math.round(((chartData.statusData['Recovered'] || 0) / state.patients.length) * 100)
                : 0}%
            </div>
          </div>
          <div className="stats-table-row">
            <div className="stats-table-label">{t('stats.peakMonth')}</div>
            <div className="stats-table-value">
              {chartData.monthlyData.reduce((a, b) => a.count > b.count ? a : b, { label: 'None', count: 0 }).label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
