import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import { PatientProvider } from './context/PatientContext';
import { usePatientContext } from './context/PatientContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import { getSession } from './utils/sessionManager';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { state } = usePatientContext();
  
  // Check session validity
  const session = getSession();
  if (!state.currentUser && !session) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <PatientProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<AppContent />} />
              </Routes>
            </div>
          </Router>
        </PatientProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
