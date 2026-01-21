import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  UserPlus,
  Trash2,
  Edit,
  Save,
  X,
  DollarSign,
  CheckCircle,
  Upload,
  Download,
  FileText
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { User } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  exportDatabase, 
  downloadDatabaseAsJSON, 
  parseExcelFile,
  parseJSONFile,
  importPatients 
} from '../utils/importExport';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { state } = usePatientContext();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { updateUser: updateUserFirebase, deleteUser: deleteUserFirebase } = useFirebaseOperations();
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'doctor' | 'admin' | 'user',
    canViewFinancial: false,
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin
  useEffect(() => {
    if (state.currentUser && state.currentUser.role !== 'admin') {
      navigate('/');
    }
    if (!state.currentUser) {
      navigate('/login');
    }
  }, [state.currentUser, navigate]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name.trim() || !userForm.email.trim() || (!editingUser && !userForm.password.trim())) {
      showError(t('common.noData'));
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        // UPDATE existing user
        const userData: Partial<User> = {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          canViewFinancial: userForm.canViewFinancial,
          updatedAt: new Date().toISOString(),
        };

        // Update metadata in Firestore
        await updateUserFirebase(editingUser.id, userData);

        // Note: Updating email or password in Firebase Auth requires re-authentication
        // For production, consider sending password reset email instead
        if (userForm.password.trim()) {
          showError('Password update not supported yet. Use password reset feature.');
        }

        showSuccess(t('admin.userUpdated') || 'User account has been updated');
      } else {
        // CREATE new user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userForm.email.trim(),
          userForm.password
        );

        // Store user metadata in Firestore using Auth UID as document ID
        const userData: Omit<User, 'id'> = {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: '', // No password stored in Firestore anymore
          role: userForm.role,
          canViewFinancial: userForm.canViewFinancial,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await FirebaseService.createUserWithId(userCredential.user.uid, userData);
        showSuccess(t('admin.userCreated') || 'New user account has been created');
      }

      setUserForm({ name: '', email: '', password: '', role: 'user', canViewFinancial: false });
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Provide user-friendly error messages
      let errorMessage = t('admin.saveError') || 'Unable to save user account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      canViewFinancial: user.canViewFinancial || false,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === state.currentUser?.id) {
      showError(t('admin.cannotDeleteSelf'));
      return;
    }
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUserFirebase(userToDelete);
        showSuccess(t('admin.userDeleted') || 'User account has been removed');
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error deleting user:', error);
        showError(t('admin.deleteError') || 'Unable to remove user account. Please try again.');
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      }
    }
  };

  const handleCancelUserForm = () => {
    setUserForm({ name: '', email: '', password: '', role: 'user', canViewFinancial: false });
    setShowUserForm(false);
    setEditingUser(null);
  };

  const toggleFinancialAccess = async (user: User) => {
    try {
      await updateUserFirebase(user.id, {
        ...user,
        canViewFinancial: !user.canViewFinancial,
      });
      showSuccess(user.canViewFinancial 
        ? (t('admin.financialAccessRevoked') || 'Financial access has been revoked')
        : (t('admin.financialAccessGranted') || 'Financial access has been granted'));
    } catch (error) {
      console.error('Error updating financial access:', error);
      showError(t('admin.accessUpdateError') || 'Unable to update access permissions. Please try again.');
    }
  };

  // Export Database
  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      const data = await exportDatabase();
      const filename = `hospital-database-${new Date().toISOString().split('T')[0]}.json`;
      downloadDatabaseAsJSON(data, filename);
      showSuccess(t('admin.exportSuccess') || 'Database exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      showError(t('admin.exportError') || `Failed to export database: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Import Patients from File
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let patients;
      const fileName = file.name.toLowerCase();
      
      // Detect file type and parse accordingly
      if (fileName.endsWith('.json')) {
        patients = await parseJSONFile(file);
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.txt')) {
        patients = await parseExcelFile(file);
      } else {
        // Try JSON first, then CSV
        try {
          patients = await parseJSONFile(file);
        } catch {
          patients = await parseExcelFile(file);
        }
      }
      
      if (patients.length === 0) {
        showError(t('admin.importNoData') || 'No valid patient data found in file');
        return;
      }

      const result = await importPatients(patients);
      if (result.success > 0) {
        showSuccess(
          t('admin.importSuccess') || 
          `Successfully imported ${result.success} patient(s)`
        );
      }
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
        showError(
          t('admin.importPartial') || 
          `Imported ${result.success} patient(s), but ${result.errors.length} failed. Check console for details.`
        );
      }
    } catch (error: any) {
      console.error('Import error:', error);
      showError(t('admin.importError') || `Failed to import patients: ${error.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  if (!state.currentUser || state.currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page fade-in" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">{t('admin.title')}</h1>
          <p className="page-subtitle">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card stats-card">
          <div className="stats-icon">
            <Users className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{state.users.length}</div>
            <div className="stats-label">{t('admin.totalUsers')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Shield className="icon" style={{ color: 'var(--info)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {state.users.filter(u => u.role === 'admin').length}
            </div>
            <div className="stats-label">{t('admin.administrators')}</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <DollarSign className="icon" style={{ color: 'var(--success)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {state.users.filter(u => u.canViewFinancial).length}
            </div>
            <div className="stats-label">{t('admin.financialAccess')}</div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText className="card-title-icon" />
            {t('admin.dataManagement') || 'Data Management'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleExportDatabase}
            disabled={isExporting}
          >
            <Download className="btn-icon" />
            {isExporting ? (t('admin.exporting') || 'Exporting...') : (t('admin.exportDatabase') || 'Export Database')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload className="btn-icon" />
            {isImporting ? (t('admin.importing') || 'Importing...') : (t('admin.importPatients') || 'Import Patients')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.txt,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem', fontSize: '0.875rem', color: 'var(--secondary-gray)' }}>
          <p style={{ margin: 0 }}>
            <strong>{t('admin.exportInfo') || 'Export:'}</strong> {t('admin.exportDescription') || 'Download complete database as JSON for backup or migration.'}
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            <strong>{t('admin.importInfo') || 'Import:'}</strong> {t('admin.importDescription') || 'Import patients from JSON (exported database) or CSV/Excel file. For CSV/Excel: Required columns: Name (Arabic), Age, Gender, Diagnosis, Date, Status, Notes.'}
          </p>
        </div>
      </div>

      {/* Users Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users className="card-title-icon" />
            {t('admin.userManagement')}
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUserForm(true)}
          >
            <UserPlus className="btn-icon" />
            {t('admin.addUser')}
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.name')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.role')}</th>
                <th>{t('admin.financialAccess')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {state.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table">
                    <div className="empty-state">
                      <Users className="empty-icon" />
                      <p>{t('admin.noUsers')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">{user.email}</div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === 'admin' ? t('admin.administrator') : user.role === 'doctor' ? t('admin.doctor') : t('admin.user')}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${user.canViewFinancial ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => toggleFinancialAccess(user)}
                        title={user.canViewFinancial ? t('admin.disabled') : t('admin.enabled')}
                        style={{ minWidth: '120px' }}
                      >
                        {user.canViewFinancial ? (
                          <>
                            <CheckCircle className="btn-icon" style={{ width: '14px', height: '14px' }} />
                            {t('admin.enabled')}
                          </>
                        ) : (
                          t('admin.disabled')
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditUser(user)}
                          title={t('admin.editUser')}
                        >
                          <Edit className="btn-icon" />
                        </button>
                        {user.id !== state.currentUser?.id && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            title={t('common.delete')}
                          >
                            <Trash2 className="btn-icon" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay" onClick={handleCancelUserForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingUser ? t('admin.editUser') : t('admin.addUser')}
              </h2>
              <button className="close-btn" onClick={handleCancelUserForm}>
                <X />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="user-form">
              <div className="form-group">
                <label className="form-label">{t('admin.fullName')} *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder={t('admin.fullName')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.emailAddress')} *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder={t('admin.emailAddress')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.password')} {!editingUser && '*'}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  placeholder={editingUser ? t('admin.keepPassword') : t('admin.password')}
                  required={!editingUser}
                />
                {editingUser && (
                  <small style={{ color: '#666', fontSize: '0.75rem' }}>{t('admin.keepPassword')}</small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.role')} *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'doctor' | 'admin' | 'user' }))}
                  className="form-select"
                >
                  <option value="user">{t('admin.user')}</option>
                  <option value="doctor">{t('admin.doctor')}</option>
                  <option value="admin">{t('admin.administrator')}</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userForm.canViewFinancial}
                    onChange={(e) => setUserForm(prev => ({ ...prev, canViewFinancial: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>{t('admin.grantAccess')}</span>
                </label>
                <small style={{ color: '#666', fontSize: '0.75rem', marginLeft: '1.75rem' }}>
                  {t('admin.financialAccessDesc')}
                </small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancelUserForm} disabled={isSaving}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  <Save className="btn-icon" />
                  {isSaving ? t('form.saving') : (editingUser ? t('admin.editUser') : t('admin.addUser'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('admin.deleteUser') || t('common.delete')}
        message={t('admin.confirmDeleteUser')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
};

export default Admin;
