import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';

// Hardcoded doctor credentials
const DOCTOR_USERNAME = 'doctor';
const DOCTOR_PASSWORD = 'password123';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientContext();
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (state.currentUser) {
      navigate('/');
    }
  }, [state.currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginForm.username === DOCTOR_USERNAME && loginForm.password === DOCTOR_PASSWORD) {
      // Create a simple user object for the doctor
      const doctorUser = {
        id: 'doctor-1',
        email: 'doctor@hospital.com',
        password: DOCTOR_PASSWORD,
        role: 'doctor' as const,
        name: 'Doctor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'SET_CURRENT_USER', payload: doctorUser });
      setLoginForm({ username: '', password: '' });
      navigate('/');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login fade-in">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Shield className="login-icon" />
            <h1 className="login-title">Doctor Login</h1>
            <p className="login-subtitle">Access the hospital management system</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="form-input"
                placeholder="Enter your username"
                required
                autoFocus
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
              Username: doctor<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

