import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { FirebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { verifyPassword, verifyPasswordWithSalt } from '../utils/passwordHash';
import { saveSession } from '../utils/sessionManager';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientContext();
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to home
    if (state.currentUser) {
      navigate('/');
    }
  }, [state.currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Find user by email
      const user = await FirebaseService.getUserByEmail(loginForm.email);
      
      if (!user) {
        setLoginError(t('login.error'));
        showError(t('login.error'));
        return;
      }

      // Check if password is hashed (contains ':' for salted hash) or plain text (backward compatibility)
      let passwordValid = false;
      if (user.password.includes(':')) {
        // Salted hash format
        passwordValid = await verifyPasswordWithSalt(loginForm.password, user.password);
      } else if (user.password.length === 64) {
        // Simple SHA-256 hash (64 hex characters)
        passwordValid = await verifyPassword(loginForm.password, user.password);
      } else {
        // Plain text password (backward compatibility - migrate on first login)
        passwordValid = user.password === loginForm.password;
        if (passwordValid) {
          // Migrate to hashed password
          const { hashPasswordWithSalt } = await import('../utils/passwordHash');
          const hashedPassword = await hashPasswordWithSalt(loginForm.password);
          await FirebaseService.updateUser(user.id, { password: hashedPassword });
        }
      }

      if (passwordValid) {
        // Remove password from user object before storing (security)
        const { password, ...userWithoutPassword } = user;
        dispatch({ type: 'SET_CURRENT_USER', payload: userWithoutPassword });
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        // Save session with expiration
        saveSession(userWithoutPassword);
        setLoginForm({ email: '', password: '' });
        showSuccess(t('login.welcomeBack') || `Welcome back, ${userWithoutPassword.name}!`, undefined, true);
        navigate('/');
      } else {
        setLoginError(t('login.error'));
        showError(t('login.error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(t('login.error'));
      showError(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login fade-in">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img 
              src="/imgs/logo.jpg" 
              alt="SurgiCare" 
              style={{ 
                width: '120px', 
                height: '120px', 
                marginBottom: '1rem',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }} 
            />
            <h1 className="login-title">{t('login.title')}</h1>
            <p className="login-subtitle">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">{t('login.email')}</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                placeholder={t('login.emailPlaceholder')}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('login.password')}</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="form-input"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            {loginError && (
              <div className="error-message login-error">
                {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
              <LogIn className="btn-icon" />
              {isLoading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
