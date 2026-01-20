import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Patient, User, SafeUser, FilterOptions } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

interface PatientState {
  patients: Patient[];
  users: User[];
  currentUser: SafeUser | null;
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
  | { type: 'SET_CURRENT_USER'; payload: SafeUser | null }
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

  // Listen for Firebase Auth state changes
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Listen for Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - get user metadata from Firestore
        try {
          const userDoc = await FirebaseService.getUserById(firebaseUser.uid);
          if (userDoc) {
            dispatch({ type: 'SET_CURRENT_USER', payload: userDoc });
            localStorage.setItem('currentUser', JSON.stringify(userDoc));
          } else {
            console.error('User authenticated but no metadata found');
            dispatch({ type: 'SET_CURRENT_USER', payload: null });
            localStorage.removeItem('currentUser');
          }
        } catch (error) {
          console.error('Error loading user metadata:', error);
          dispatch({ type: 'SET_CURRENT_USER', payload: null });
        }
      } else {
        // User is signed out
        dispatch({ type: 'SET_CURRENT_USER', payload: null });
        localStorage.removeItem('currentUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // Monitor online status
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      unsubscribeAuth();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set up Firestore listeners ONLY when user is authenticated
  useEffect(() => {
    if (!state.currentUser) {
      // No user logged in - clear data and don't set up listeners
      dispatch({ type: 'SET_PATIENTS', payload: [] });
      dispatch({ type: 'SET_USERS', payload: [] });
      return;
    }

    // User is authenticated - now it's safe to set up Firestore listeners
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const unsubscribePatients = FirebaseService.subscribeToPatients((patients) => {
        dispatch({ type: 'SET_PATIENTS', payload: patients });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: null });
      });

      const unsubscribeUsers = FirebaseService.subscribeToUsers((users) => {
        dispatch({ type: 'SET_USERS', payload: users });
      });

      // Cleanup listeners when component unmounts or user changes
      return () => {
        unsubscribePatients();
        unsubscribeUsers();
      };
    } catch (error: any) {
      console.error('Error setting up Firestore listeners:', error);
      
      // Provide helpful error message based on error type
      let errorMessage = 'Failed to load data';
      if (error?.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please make sure Firestore rules are deployed.';
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentUser]); // Re-run when currentUser changes


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
