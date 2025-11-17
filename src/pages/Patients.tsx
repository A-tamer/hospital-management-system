import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Users,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { Patient, FilterOptions } from '../types';
import PatientForm from '../components/PatientForm';
import { generatePDFReport } from '../utils/pdfGenerator';

const Patients: React.FC = () => {
  const { state, dispatch } = usePatientContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Check if we need to open edit form from navigation state
  useEffect(() => {
    const navState = location.state as { editPatientId?: string } | null;
    if (navState?.editPatientId) {
      const patient = state.patients.find((p: Patient) => p.id === navState.editPatientId);
      if (patient) {
        setEditingPatient(patient);
        setShowForm(true);
        // Clear state after using it
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, state.patients, navigate, location.pathname]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    diagnosis: '',
    status: '',
    year: '',
    month: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const filteredPatients = useMemo(() => {
    let filtered = state.patients;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.fullName.toLowerCase().includes(searchLower) ||
        patient.code.toLowerCase().includes(searchLower) ||
        patient.diagnosis.toLowerCase().includes(searchLower)
      );
    }

    // Diagnosis filter
    if (filters.diagnosis) {
      filtered = filtered.filter(patient => patient.diagnosis === filters.diagnosis);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(patient => {
        const d = new Date(patient.admissionDate);
        const admissionYear = d.getFullYear().toString();
        return admissionYear === filters.year;
      });
    }

    // Month filter (01..12)
    if (filters.month) {
      filtered = filtered.filter(patient => {
        const d = new Date(patient.admissionDate);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return month === filters.month;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.admissionDate).getTime();
          bValue = new Date(b.admissionDate).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [state.patients, filters]);

  const uniqueDiagnoses = useMemo(() => {
    return Array.from(new Set(state.patients.map(p => p.diagnosis))).sort();
  }, [state.patients]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(state.patients.map(p => 
      new Date(p.admissionDate).getFullYear().toString()
    ))).sort((a, b) => b.localeCompare(a));
  }, [state.patients]);

  const uniqueMonths = useMemo(() => {
    const months = new Set(
      state.patients
        .filter(p => !filters.year || new Date(p.admissionDate).getFullYear().toString() === filters.year)
        .map(p => String(new Date(p.admissionDate).getMonth() + 1).padStart(2, '0'))
    );
    return Array.from(months).sort();
  }, [state.patients, filters.year]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      dispatch({ type: 'DELETE_PATIENT', payload: id });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleSort = (sortBy: 'name' | 'date' | 'status') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const generatePatientCode = () => {
    const year = new Date().getFullYear();
    const count = state.patients.length + 1;
    return `P${year}${count.toString().padStart(4, '0')}`;
  };

  const handleExportPDF = () => {
    const reportTitle = filters.search || filters.diagnosis || filters.status || filters.year 
      ? `Filtered Patient Records - ${new Date().toLocaleDateString()}`
      : 'Complete Patient Records Report';
    
    generatePDFReport.patients(filteredPatients, reportTitle);
  };

  return (
    <div className="patients-page fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Patient Records</h1>
          <p className="page-subtitle">Manage and track patient information</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus className="btn-icon" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="search-filter-container">
          <div className="search-input">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search patients by name, code, or diagnosis..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <select
              value={filters.diagnosis}
              onChange={(e) => setFilters(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="form-select"
            >
              <option value="">All Diagnoses</option>
              {uniqueDiagnoses.map(diagnosis => (
                <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Recovered">Recovered</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="form-select"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.month || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              className="form-select"
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users className="card-title-icon" />
            Patients ({filteredPatients.length})
          </h2>
          <div className="table-actions">
            <button className="btn btn-sm btn-primary" onClick={handleExportPDF}>
              <Download className="btn-icon" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <button 
                    className="sort-btn"
                    onClick={() => handleSort('name')}
                  >
                    Patient Code
                    {filters.sortBy === 'name' && (
                      filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />
                    )}
                  </button>
                </th>
                <th>Full Name</th>
                <th>Age / Gender</th>
                <th>Diagnosis</th>
                <th>
                  <button 
                    className="sort-btn"
                    onClick={() => handleSort('date')}
                  >
                    Admission Date
                    {filters.sortBy === 'date' && (
                      filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />
                    )}
                  </button>
                </th>
                <th>
                  <button 
                    className="sort-btn"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {filters.sortBy === 'status' && (
                      filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />
                    )}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table">
                    <div className="empty-state">
                      <Users className="empty-icon" />
                      <p>No patients found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-code">{patient.code}</div>
                    </td>
                    <td>
                      <div 
                        className="patient-name" 
                        style={{ cursor: 'pointer', color: 'var(--primary-teal)', textDecoration: 'underline' }}
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        title="Click to view full details"
                      >
                        {patient.fullName}
                      </div>
                    </td>
                    <td>
                      <div className="patient-details">
                        {patient.age} years • {patient.gender}
                      </div>
                    </td>
                    <td>
                      <div className="patient-diagnosis">{patient.diagnosis}</div>
                    </td>
                    <td>
                      <div className="patient-date">
                        {new Date(patient.admissionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(patient)}
                          title="Edit Patient"
                        >
                          <Edit className="btn-icon" />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(patient.id)}
                          title="Delete Patient"
                        >
                          <Trash2 className="btn-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onClose={handleFormClose}
          generateCode={generatePatientCode}
        />
      )}
    </div>
  );
};

export default Patients;
