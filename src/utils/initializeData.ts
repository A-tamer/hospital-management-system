import { FirebaseService } from '../services/firebaseService';
import { samplePatients, sampleUsers } from './sampleData';
import { Patient, User } from '../types';

/**
 * Initialize dummy data in Firebase if database is empty
 * This runs once when the app starts and Firebase is empty
 */
export const initializeDummyData = async (): Promise<void> => {
  try {
    // Check if patients exist
    const existingPatients = await FirebaseService.getPatients();
    const existingUsers = await FirebaseService.getUsers();

    // Insert patients if none exist
    if (existingPatients.length === 0) {
      console.log('Initializing dummy patient data...');
      for (const patient of samplePatients) {
        try {
          // Remove id field - Firebase will generate it
          const { id, ...patientWithoutId } = patient;
          await FirebaseService.addPatient(patientWithoutId);
        } catch (error) {
          console.error(`Error adding patient ${patient.code}:`, error);
        }
      }
      console.log(`✅ Inserted ${samplePatients.length} sample patients`);
    }

    // Insert users if none exist
    if (existingUsers.length === 0) {
      console.log('Initializing dummy user data...');
      for (const user of sampleUsers) {
        try {
          // Remove id field - Firebase will generate it
          const { id, ...userWithoutId } = user;
          await FirebaseService.addUser(userWithoutId);
        } catch (error) {
          console.error(`Error adding user ${user.email}:`, error);
        }
      }
      console.log(`✅ Inserted ${sampleUsers.length} sample users`);
    }
  } catch (error) {
    console.error('Error initializing dummy data:', error);
  }
};

