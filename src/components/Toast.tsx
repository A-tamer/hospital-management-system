import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number, isWelcome?: boolean) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message: string, duration?: number, isWelcome?: boolean) => {
    if (isWelcome) {
      // Welcome messages are bigger and last longer
      showToast(message, 'success', duration || 8000);
    } else {
      showToast(message, 'success', duration);
    }
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" />;
      case 'error':
        return <AlertCircle className="toast-icon" />;
      case 'warning':
        return <AlertTriangle className="toast-icon" />;
      case 'info':
      default:
        return <Info className="toast-icon" />;
    }
  };

  const getToastColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
      default:
        return 'var(--primary-teal)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            style={{
              borderLeft: `4px solid ${getToastColor(toast.type)}`,
            }}
          >
            <div className="toast-content">
              <div className="toast-icon-wrapper" style={{ color: getToastColor(toast.type) }}>
                {getToastIcon(toast.type)}
              </div>
              <div 
              className="toast-message"
              style={toast.duration && toast.duration > 5000 ? { fontSize: '1.1rem', fontWeight: '600' } : {}}
            >
              {toast.message}
            </div>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              <X className="toast-close-icon" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

