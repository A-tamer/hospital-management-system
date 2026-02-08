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
  ChevronRight,
  LogIn,
  LogOut
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { Patient, FilterOptions } from '../types';
import PatientForm from '../components/PatientForm';
import { generatePDFReport } from '../utils/pdfGenerator';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

const Patients: React.FC = () => {
  const { state, dispatch } = usePatientContext();
  const { deletePatient, updatePatient } = useFirebaseOperations();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [updatingPresence, setUpdatingPresence] = useState<string | null>(null);
  
  // Initialize filters state first
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    diagnosis: '',
    status: '',
    year: '',
    month: '',
    sortBy: 'name',
    sortOrder: 'asc',
    presentOnly: false,
  });

  // Check if we need to open edit form from navigation state OR restore filters
  useEffect(() => {
    const navState = location.state as { editPatientId?: string; showPresentOnly?: boolean; filterStatus?: string; restoreFilters?: FilterOptions } | null;
    
    // Restore filters if coming back from patient detail
    if (navState?.restoreFilters) {
      setFilters(navState.restoreFilters);
      // Clear state after using it
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }
    
    if (navState?.editPatientId) {
      const patient = state.patients.find((p: Patient) => p.id === navState.editPatientId);
      if (patient) {
        setEditingPatient(patient);
        setShowForm(true);
        // Clear state after using it
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
    // Auto-enable present filter if coming from dashboard
    if (navState?.showPresentOnly) {
      setFilters(prev => ({ ...prev, presentOnly: true }));
      // Clear state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Auto-enable status filter if coming from dashboard
    if (navState?.filterStatus) {
      setFilters(prev => ({ ...prev, status: navState.filterStatus || '' }));
      // Clear state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, state.patients, navigate, location.pathname]);
  
  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('patientFilters', JSON.stringify(filters));
  }, [filters]);

  const filteredPatients = useMemo(() => {
    let filtered = state.patients;

    // Search filter - supports both English and Arabic names
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchArabic = filters.search; // Keep original for Arabic search
      filtered = filtered.filter(patient => {
        // Check name and code
        if ((patient.fullNameArabic && patient.fullNameArabic.includes(searchArabic)) ||
            patient.code.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Check all diagnoses
        const allDiagnoses = (patient as any).diagnoses || [patient.diagnosis];
        return allDiagnoses.some((d: string) => d && d.toLowerCase().includes(searchLower));
      });
    }

    // Diagnosis filter
    if (filters.diagnosis) {
      filtered = filtered.filter(patient => {
        const allDiagnoses = (patient as any).diagnoses || [patient.diagnosis];
        return allDiagnoses.includes(filters.diagnosis);
      });
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

    // Present at clinic filter
    if (filters.presentOnly) {
      filtered = filtered.filter(patient => (patient as any).presentAtClinic === true);
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

  const handleCheckIn = async (patient: Patient) => {
    if (!patient.id) return;
    setUpdatingPresence(patient.id);
    try {
      await updatePatient(patient.id, {
        ...patient,
        presentAtClinic: true,
        clinicCheckInTime: new Date().toISOString()
      } as any);
      showSuccess('Patient checked in successfully');
    } catch (error) {
      console.error('Check-in error:', error);
      showError('Failed to check in patient');
    } finally {
      setUpdatingPresence(null);
    }
  };

  const handleCheckOut = async (patient: Patient) => {
    if (!patient.id) return;
    setUpdatingPresence(patient.id);
    try {
      await updatePatient(patient.id, {
        ...patient,
        presentAtClinic: false,
        clinicCheckInTime: undefined
      } as any);
      showSuccess('Patient checked out successfully');
    } catch (error) {
      console.error('Check-out error:', error);
      showError('Failed to check out patient');
    } finally {
      setUpdatingPresence(null);
    }
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        // Delete from Firestore
        await deletePatient(patientToDelete);

        // Optimistically update local state
        dispatch({ type: 'DELETE_PATIENT', payload: patientToDelete });
        showSuccess(t('patients.patientDeleted') || 'Patient record removed successfully');

        // Reset to first page if current page becomes empty
        const remainingPatients = filteredPatients.filter(p => p.id !== patientToDelete);
        const maxPage = Math.ceil(remainingPatients.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        }
      } catch (error) {
        console.error('Failed to delete patient from database:', error);
        showError(t('patients.deleteFailed') || 'Failed to delete patient. Please try again.');
      } finally {
        setShowDeleteConfirm(false);
        setPatientToDelete(null);
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
  }, [filters.search, filters.diagnosis, filters.status, filters.year, filters.month, filters.presentOnly]);

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
              <option value="Op">Op</option>
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
            
            {/* Present at Clinic Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, presentOnly: !prev.presentOnly }))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: filters.presentOnly ? '2px solid #28a745' : '2px solid #dee2e6',
                background: filters.presentOnly ? '#28a745' : 'white',
                color: filters.presentOnly ? 'white' : '#495057',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: filters.presentOnly ? 'white' : '#28a745', 
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              {filters.presentOnly ? 'Present Patients' : 'Show Present Only'}
            </button>
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
                paginatedPatients.map((patient) => {
                  const allDiagnoses = (patient as any).diagnoses || (patient.diagnosis ? [patient.diagnosis] : []);
                  const isUndiagnosed = allDiagnoses.length === 0 || (allDiagnoses.length === 1 && allDiagnoses[0] === 'Undiagnosed');
                  return (
                  <tr 
                    key={patient.id}
                    style={isUndiagnosed ? { 
                      backgroundColor: '#fff3cd', 
                      borderLeft: '4px solid #ffc107' 
                    } : {}}
                  >
                    <td>
                      <div className="patient-code">{patient.code}</div>
                    </td>
                    <td onClick={() => navigate(`/patient/${patient.id}`)} style={{ cursor: 'pointer' }}>
                      <div 
                        className="patient-name" 
                        style={{ cursor: 'pointer', color: 'var(--primary-blue)', textDecoration: 'underline', direction: 'rtl', textAlign: 'right' }}
                        title={t('patients.clickToView')}
                      >
                        {patient.fullNameArabic || 'No Name'}
                      </div>
                    </td>
                    <td>
                      <div className="patient-details">
                        {(() => {
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
                              return months > 0 ? `${years}y ${months}m` : `${years} ${t('patients.yearsOld')}`;
                            } else {
                              const days = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
                              return months > 0 ? `${months} months` : `${days} days`;
                            }
                          } else {
                            return `${Math.floor(patient.age)} ${t('patients.yearsOld')}`;
                          }
                        })()}
                        {' • '}
                        {patient.gender === 'Male' ? t('gender.male') : patient.gender === 'Female' ? t('gender.female') : t('gender.other')}
                      </div>
                    </td>
                    <td>
                      <div className="patient-diagnosis">
                        {isUndiagnosed ? (
                          <span style={{ color: '#856404', fontWeight: 'bold' }}>
                            ⚠️ Undiagnosed
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {allDiagnoses.slice(0, 2).map((diag: string, idx: number) => (
                              <span key={idx} style={{ 
                                fontSize: idx === 0 ? '0.9rem' : '0.8rem',
                                fontWeight: idx === 0 ? '500' : '400',
                                color: idx === 0 ? '#333' : '#666'
                              }}>
                                {diag}
                              </span>
                            ))}
                            {allDiagnoses.length > 2 && (
                              <span style={{ fontSize: '0.75rem', color: '#17a2b8', fontWeight: '500' }}>
                                +{allDiagnoses.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="patient-date">
                        {new Date(patient.visitedDate || (patient as any).admissionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${patient.status.toLowerCase().replace('-', '-')}`}>
                        {patient.status === 'Diagnosed' ? t('status.diagnosed') : 
                         patient.status === 'Pre-op' ? t('status.preOp') : 
                         patient.status === 'Op' ? 'Op' : 
                         t('status.postOp')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {/* Check-In / Check-Out Button */}
                        {(patient as any).presentAtClinic ? (
                          <button
                            className="btn btn-sm"
                            onClick={() => handleCheckOut(patient)}
                            disabled={updatingPresence === patient.id}
                            title="Check Out"
                            style={{ 
                              background: '#dc3545', 
                              color: 'white',
                              minWidth: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.5rem'
                            }}
                          >
                            <LogOut size={16} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => handleCheckIn(patient)}
                            disabled={updatingPresence === patient.id}
                            title="Check In"
                            style={{ 
                              background: '#28a745', 
                              color: 'white',
                              minWidth: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.5rem'
                            }}
                          >
                            <LogIn size={16} />
                          </button>
                        )}
                        
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(patient)}
                          title={t('patients.editPatient')}
                        >
                          <Edit className="btn-icon" />
                        </button>
                        {state.currentUser?.role === 'admin' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(patient.id)}
                            title={t('common.delete')}
                          >
                            <Trash2 className="btn-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
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
