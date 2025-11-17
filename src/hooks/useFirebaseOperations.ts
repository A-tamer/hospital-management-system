import { useCallback } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { FirebaseService } from '../services/firebaseService';
import { Patient, User } from '../types';

export const useFirebaseOperations = () => {
  const { state, dispatch } = usePatientContext();

  const addPatient = useCallback(async (patient: Omit<Patient, 'id'>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const patientId = await FirebaseService.addPatient(patient);
      
      // The real-time listener will automatically update the state
      return patientId;
    } catch (error) {
      console.error('Error adding patient:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add patient' });
      throw error;
    }
  }, [dispatch]);

  const updatePatient = useCallback(async (patientId: string, patient: Partial<Patient>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await FirebaseService.updatePatient(patientId, patient);
      
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error updating patient:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update patient' });
      throw error;
    }
  }, [dispatch]);

  const deletePatient = useCallback(async (patientId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await FirebaseService.deletePatient(patientId);
      
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error deleting patient:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete patient' });
      throw error;
    }
  }, [dispatch]);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = await FirebaseService.addUser(user);
      
      // The real-time listener will automatically update the state
      return userId;
    } catch (error) {
      console.error('Error adding user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add user' });
      throw error;
    }
  }, [dispatch]);

  const updateUser = useCallback(async (userId: string, user: Partial<User>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await FirebaseService.updateUser(userId, user);
      
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error updating user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user' });
      throw error;
    }
  }, [dispatch]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await FirebaseService.deleteUser(userId);
      
      // The real-time listener will automatically update the state
    } catch (error) {
      console.error('Error deleting user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete user' });
      throw error;
    }
  }, [dispatch]);

  const loginUser = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const user = await FirebaseService.getUserByEmail(email);
      
      if (user && user.password === password) {
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Invalid email or password' });
      throw error;
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  }, [dispatch]);

  return {
    addPatient,
    updatePatient,
    deletePatient,
    addUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
    isOnline: state.isOnline,
    isLoading: state.isLoading,
    error: state.error,
  };
};

