import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Patient, User, FilterOptions } from '../types';
import { initializeSampleData } from '../utils/sampleData';
import { FirebaseService } from '../services/firebaseService';

interface PatientState {
  patients: Patient[];
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  filters: FilterOptions;
  isOnline: boolean;
  error: string | null;
}

type PatientAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PATIENTS'; payload: Patient[] }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: PatientState = {
  patients: [],
  users: [],
  currentUser: null,
  isLoading: false,
  filters: {
    search: '',
    diagnosis: '',
    status: '',
    year: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  isOnline: true,
  error: null,
};

const PatientContext = createContext<{
  state: PatientState;
  dispatch: React.Dispatch<PatientAction>;
} | null>(null);

const patientReducer = (state: PatientState, action: PatientAction): PatientState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(patient =>
          patient.id === action.payload.id ? action.payload : patient
        ),
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(patient => patient.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  // Initialize Firebase and set up real-time listeners
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        

        // Set up real-time listeners
        const unsubscribePatients = FirebaseService.subscribeToPatients((patients) => {
          dispatch({ type: 'SET_PATIENTS', payload: patients });
          dispatch({ type: 'SET_LOADING', payload: false });
        });

        const unsubscribeUsers = FirebaseService.subscribeToUsers((users) => {
          dispatch({ type: 'SET_USERS', payload: users });
        });

        // Load current user from localStorage (for session persistence)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        dispatch({ type: 'SET_CURRENT_USER', payload: currentUser });

        // Monitor online status
        const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
        const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function
        return () => {
          unsubscribePatients();
          unsubscribeUsers();
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to database' });
        dispatch({ type: 'SET_LOADING', payload: false });
        
        // Fallback to localStorage if Firebase fails
        try {
          initializeSampleData();
          const patients = JSON.parse(localStorage.getItem('patients') || '[]');
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
          
          dispatch({ type: 'SET_PATIENTS', payload: patients });
          dispatch({ type: 'SET_USERS', payload: users });
          dispatch({ type: 'SET_CURRENT_USER', payload: currentUser });
          dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      }
    };

    initializeFirebase();
  }, []);

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  return (
    <PatientContext.Provider value={{ state, dispatch }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
};
