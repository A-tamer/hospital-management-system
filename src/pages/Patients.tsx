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
  SortDesc,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { Patient, FilterOptions } from '../types';
import PatientForm from '../components/PatientForm';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

const Patients: React.FC = () => {
  const { state, dispatch } = usePatientContext();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

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

    // Search filter - supports both English and Arabic names
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchArabic = filters.search; // Keep original for Arabic search
      filtered = filtered.filter(patient =>
        (patient.fullNameArabic && patient.fullNameArabic.includes(searchArabic)) ||
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

    // Year filter (using visitedDate)
    if (filters.year) {
      filtered = filtered.filter(patient => {
        const dateField = patient.visitedDate || (patient as any).admissionDate;
        const d = new Date(dateField);
        const year = d.getFullYear().toString();
        return year === filters.year;
      });
    }

    // Month filter (01..12)
    if (filters.month) {
      filtered = filtered.filter(patient => {
        const dateField = patient.visitedDate || (patient as any).admissionDate;
        const d = new Date(dateField);
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
          aValue = (a.fullNameArabic || '').toLowerCase();
          bValue = (b.fullNameArabic || '').toLowerCase();
          break;
        case 'date':
          const aDate = a.visitedDate || (a as any).admissionDate;
          const bDate = b.visitedDate || (b as any).admissionDate;
          aValue = new Date(aDate).getTime();
          bValue = new Date(bDate).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = (a.fullNameArabic || '').toLowerCase();
          bValue = (b.fullNameArabic || '').toLowerCase();
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
    return Array.from(new Set(state.patients.map(p => {
      const dateField = p.visitedDate || (p as any).admissionDate;
      return new Date(dateField).getFullYear().toString();
    }))).sort((a, b) => b.localeCompare(a));
  }, [state.patients]);

  const uniqueMonths = useMemo(() => {
    const months = new Set(
      state.patients
        .filter(p => {
          const dateField = p.visitedDate || (p as any).admissionDate;
          return !filters.year || new Date(dateField).getFullYear().toString() === filters.year;
        })
        .map(p => {
          const dateField = p.visitedDate || (p as any).admissionDate;
          return String(new Date(dateField).getMonth() + 1).padStart(2, '0');
        })
    );
    return Array.from(months).sort();
  }, [state.patients, filters.year]);

  const handleDelete = (id: string) => {
    setPatientToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      dispatch({ type: 'DELETE_PATIENT', payload: patientToDelete });
      showSuccess(t('patients.patientDeleted') || 'Patient record removed successfully');
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
      // Reset to first page if current page becomes empty
      const remainingPatients = filteredPatients.filter(p => p.id !== patientToDelete);
      const maxPage = Math.ceil(remainingPatients.length / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
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
    const { generatePatientCode: generateCode } = require('../utils/importExport');
    return generateCode(state.patients);
  };

  const handleExportPDF = () => {
    try {
      const reportTitle = filters.search || filters.diagnosis || filters.status || filters.year 
        ? `Filtered Patient Records - ${new Date().toLocaleDateString()}`
        : 'Complete Patient Records Report';
      
      generatePDFReport.patients(filteredPatients, reportTitle);
      showSuccess(t('patients.exportComplete') || 'Patient records exported successfully');
      } catch (error) {
      showError(t('patients.exportFailed') || 'Unable to generate PDF. Please try again.');
    }
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPatients.length);
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
  
  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.diagnosis, filters.status, filters.year, filters.month]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="patients-page fade-in">
      <div className="page-header animate-fade-in-up">
        <div className="page-title-section">
          <h1 className="page-title">
            {t('patients.title')}
          </h1>
          <p className="page-subtitle">
            {t('patients.subtitle')}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus className="btn-icon" />
            {t('patients.addPatient')}
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
                placeholder={t('patients.searchPlaceholder')}
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
              <option value="">{t('patients.allDiagnoses')}</option>
              {uniqueDiagnoses.map(diagnosis => (
                <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="form-select"
            >
              <option value="">{t('patients.allStatus')}</option>
              <option value="Diagnosed">{t('status.diagnosed')}</option>
              <option value="Pre-op">{t('status.preOp')}</option>
              <option value="Post-op">{t('status.postOp')}</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="form-select"
            >
              <option value="">{t('patients.allYears')}</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.month || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              className="form-select"
            >
              <option value="">{t('patients.allMonths')}</option>
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
            {t('nav.patients')} ({filteredPatients.length})
            {filteredPatients.length > itemsPerPage && (
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.5rem', color: 'var(--secondary-gray)' }}>
                ({startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} {t('common.of')} {filteredPatients.length})
              </span>
            )}
          </h2>
          <div className="table-actions">
            <button className="btn btn-sm btn-primary" onClick={handleExportPDF}>
              <Download className="btn-icon" />
              {t('patients.exportPDF')}
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
                    {t('patients.patientCode')}
                    {filters.sortBy === 'name' && (
                      filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />
                    )}
                  </button>
                </th>
                <th>{t('patients.fullName')}</th>
                <th>{t('patients.age')} / {t('patients.gender')}</th>
                <th>{t('patients.diagnosis')}</th>
                <th>
                  <button 
                    className="sort-btn"
                    onClick={() => handleSort('date')}
                  >
                    {t('patients.visitedDate')}
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
                    {t('patients.status')}
                    {filters.sortBy === 'status' && (
                      filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />
                    )}
                  </button>
                </th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table">
                    <div className="empty-state">
                      <Users className="empty-icon" />
                      <p>{t('patients.noPatients')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-code">{patient.code}</div>
                    </td>
                    <td onClick={() => navigate(`/patient/${patient.id}`)} style={{ cursor: 'pointer' }}>
                      <div 
                        className="patient-name" 
                        style={{ cursor: 'pointer', color: 'var(--primary-teal)', textDecoration: 'underline', direction: 'rtl', textAlign: 'right' }}
                        title={t('patients.clickToView')}
                      >
                        {patient.fullNameArabic || 'No Name'}
                      </div>
                    </td>
                    <td>
                      <div className="patient-details">
                        {patient.age} {t('patients.yearsOld')} • {patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')}
                      </div>
                    </td>
                    <td>
                      <div className="patient-diagnosis">{patient.diagnosis}</div>
                    </td>
                    <td>
                      <div className="patient-date">
                        {new Date(patient.visitedDate || (patient as any).admissionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${patient.status.toLowerCase().replace('-', '-')}`}>
                        {patient.status === 'Diagnosed' ? t('status.diagnosed') : patient.status === 'Pre-op' ? t('status.preOp') : t('status.postOp')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(patient)}
                          title={t('patients.editPatient')}
                        >
                          <Edit className="btn-icon" />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(patient.id)}
                          title={t('common.delete')}
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

      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="card">
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="btn-icon" />
              {t('common.previous')}
            </button>
            
            <div className="pagination-info">
              {t('common.page')} {currentPage} {t('common.of')} {totalPages}
              <span style={{ margin: '0 0.5rem', color: 'var(--secondary-gray)' }}>•</span>
              {filteredPatients.length} {t('common.total') || 'total'}
            </div>

            <select
              className="pagination-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 {t('common.perPage')}</option>
              <option value={20}>20 {t('common.perPage')}</option>
              <option value={50}>50 {t('common.perPage')}</option>
              <option value={100}>100 {t('common.perPage')}</option>
            </select>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
              <ChevronRight className="btn-icon" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('common.delete')}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPatientToDelete(null);
        }}
        type="danger"
      />

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onClose={handleFormClose}
          generateCode={generatePatientCode}
          allPatients={state.patients}
        />
      )}
    </div>
  );
};

export default Patients;
