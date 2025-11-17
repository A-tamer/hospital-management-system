import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  Users, 
  Settings, 
  Shield, 
  UserPlus,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { User } from '../types';

const Admin: React.FC = () => {
  const { state, dispatch } = usePatientContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'doctor' | 'admin' | 'user',
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Initialize with default admin user if no users exist
    if (state.users.length === 0) {
      const defaultAdmin: User = {
        id: '1',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
      };
      dispatch({ type: 'SET_USERS', payload: [defaultAdmin] });
    }
  }, [state.users.length, dispatch]);

  useEffect(() => {
    setIsLoggedIn(!!state.currentUser);
  }, [state.currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = state.users.find(
      u => u.email === loginForm.email && u.password === loginForm.password
    );

    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      setLoginForm({ email: '', password: '' });
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      return;
    }

    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      role: userForm.role,
    };

    if (editingUser) {
      const updatedUsers = state.users.map(user =>
        user.id === editingUser.id ? userData : user
      );
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
    } else {
      dispatch({ type: 'SET_USERS', payload: [...state.users, userData] });
    }

    setUserForm({ name: '', email: '', password: '', role: 'user' });
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = state.users.filter(user => user.id !== userId);
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
    }
  };

  const handleCancelUserForm = () => {
    setUserForm({ name: '', email: '', password: '', role: 'user' });
    setShowUserForm(false);
    setEditingUser(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login fade-in">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <Shield className="login-icon" />
              <h1 className="login-title">Admin Login</h1>
              <p className="login-subtitle">Access the administrative panel</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {loginError && (
                <div className="error-message login-error">
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn btn-primary login-btn">
                <LogIn className="btn-icon" />
                Sign In
              </button>
            </form>

            <div className="login-footer">
              <p className="demo-credentials">
                <strong>Demo Credentials:</strong><br />
                Email: admin@hospital.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users and system settings</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut className="btn-icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-3">
        <div className="card stats-card">
          <div className="stats-icon">
            <Users className="icon" style={{ color: 'var(--primary-teal)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">{state.users.length}</div>
            <div className="stats-label">Total Users</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Shield className="icon" style={{ color: 'var(--primary-purple)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {state.users.filter(u => u.role === 'admin').length}
            </div>
            <div className="stats-label">Administrators</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon">
            <Settings className="icon" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div className="stats-content">
            <div className="stats-number">
              {state.users.filter(u => u.role === 'user').length}
            </div>
            <div className="stats-label">Regular Users</div>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users className="card-title-icon" />
            User Management
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUserForm(true)}
          >
            <UserPlus className="btn-icon" />
            Add User
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user) => (
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
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <Edit className="btn-icon" />
                      </button>
                      {user.id !== state.currentUser?.id && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <Trash2 className="btn-icon" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay" onClick={handleCancelUserForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button className="close-btn" onClick={handleCancelUserForm}>
                <X />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="user-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'doctor' | 'admin' | 'user' }))}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancelUserForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save className="btn-icon" />
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

