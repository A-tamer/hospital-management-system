import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Hospital,
  LogOut
} from 'lucide-react';
import { usePatientContext } from '../context/PatientContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { state, dispatch } = usePatientContext();

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Hospital className="brand-icon" />
          <span className="brand-text">Hospital Management</span>
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
          {state.currentUser ? (
            <div className="user-info">
              <span className="user-name">{state.currentUser.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="logout-icon" />
              </button>
            </div>
          ) : (
            <span className="login-prompt">Please log in</span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

