import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { FirebaseService } from '../services/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

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
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );

      // Get user metadata from Firestore using Firebase Auth UID
      const userDoc = await FirebaseService.getUserById(userCredential.user.uid);
      
      if (!userDoc) {
        // User authenticated but no metadata in Firestore
        setLoginError('User data not found. Please contact administrator.');
        showError('User data not found. Please contact administrator.');
        await auth.signOut();
        return;
      }

      // Store user data in context (without password - not stored in Firestore anymore)
      dispatch({ type: 'SET_CURRENT_USER', payload: userDoc });
      localStorage.setItem('currentUser', JSON.stringify(userDoc));
      
      setLoginForm({ email: '', password: '' });
      showSuccess(t('login.welcomeBack') || `Welcome back, ${userDoc.name}!`, undefined, true);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = t('login.error') || 'Invalid email or password';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection';
      }
      
      setLoginError(errorMessage);
      showError(errorMessage);
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
