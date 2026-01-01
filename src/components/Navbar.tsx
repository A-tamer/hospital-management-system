import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Shield,
  LogOut,
  Languages
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { clearSession } from '../utils/sessionManager';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { state, dispatch } = usePatientContext();
  const { language, setLanguage, t, dir } = useLanguage();

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    clearSession();
    window.location.href = '/login';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { path: '/', label: t('nav.patients'), icon: Users, key: 'nav.patients' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home, key: 'nav.dashboard' },
    { path: '/statistics', label: t('nav.statistics'), icon: BarChart3, key: 'nav.statistics' },
  ];

  // Add Admin link if user is admin
  if (state.currentUser?.role === 'admin') {
    navItems.push({ path: '/admin', label: t('nav.admin'), icon: Shield, key: 'nav.admin' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img 
            src="/imgs/logo.jpg" 
            alt="Surgicare" 
            className="brand-logo" 
            style={{ 
              width: '60px', 
              height: '60px', 
              marginRight: '0.75rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }} 
          />
          <span className="brand-text" style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Surgicare</span>
        </div>
        
        <div className="navbar-menu">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`navbar-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon className="navbar-icon" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <button 
            onClick={toggleLanguage} 
            className="language-btn"
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Languages className="language-icon" />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
          {state.currentUser ? (
            <div className="user-info">
              <span className="user-name">{state.currentUser.name}</span>
              <button onClick={handleLogout} className="logout-btn" title={t('nav.logout')}>
                <LogOut className="logout-icon" />
              </button>
            </div>
          ) : (
            <span className="login-prompt">{t('nav.login')}</span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

