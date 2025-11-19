// src/services/firebaseService.ts
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { Patient, User } from '../types';

export const FirebaseService = {
  // 🧠 --- PATIENT FUNCTIONS ---
  async getPatients(): Promise<Patient[]> {
    const snapshot = await getDocs(collection(db, 'patients'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Patient[];
  },

  async addPatient(patient: Omit<Patient, 'id'>): Promise<string> {
    // Remove undefined or invalid values completely
    const sanitizedPatient = Object.entries(patient).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  
    // Set safe defaults for any missing fields while preserving extra fields
    const finalPatient = {
      ...sanitizedPatient,
      fullNameArabic: sanitizedPatient.fullNameArabic || sanitizedPatient.fullName || 'Unknown',
      code: sanitizedPatient.code || '',
      age: sanitizedPatient.age || '',
      gender: sanitizedPatient.gender || '',
      diagnosis: sanitizedPatient.diagnosis || '',
      status: sanitizedPatient.status || 'Diagnosed',
      visitedDate: sanitizedPatient.visitedDate || sanitizedPatient.admissionDate || null,
      admissionDate: sanitizedPatient.visitedDate || sanitizedPatient.admissionDate || null, // Keep for backward compatibility
      notes: sanitizedPatient.notes ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
  
    try {
      const docRef = await addDoc(collection(db, "patients"), finalPatient);
      return docRef.id;
    } catch (error) {
      console.error("Error adding patient to Firestore:", error);
      throw error;
    }
  },
  
  // 📦 --- FILE UPLOADS ---
  async uploadPatientFile(patientCode: string, file: File, folder: string = 'attachments'): Promise<string> {
    try {
      // Sanitize file name - remove special characters
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const safeName = `${Date.now()}-${sanitizedName}`;
      const objectPath = `patients/${patientCode}/${folder}/${safeName}`;
      
      const storageRef = ref(storage, objectPath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return url;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updatePatient(id: string, updatedData: Partial<Patient>) {
    const ref = doc(db, 'patients', id);

    // ✅ Clean undefined fields before updating
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    await updateDoc(ref, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    });
  },

  async deletePatient(id: string) {
    const ref = doc(db, 'patients', id);
    await deleteDoc(ref);
  },

  subscribeToPatients(callback: (patients: Patient[]) => void): Unsubscribe {
    const unsubscribe = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];
      callback(patients);
    });
    return unsubscribe;
  },

  // 👤 --- USER FUNCTIONS ---
  async getUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  },

  async addUser(user: Omit<User, 'id'>): Promise<string> {
    const safeUser = {
      name: user.name || 'Unnamed User',
      email: user.email || '',
      password: user.password || '',
      role: user.role || 'user',
      canViewFinancial: user.canViewFinancial || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'users'), safeUser);
    return docRef.id;
  },

  async updateUser(id: string, updatedData: Partial<User>) {
    const ref = doc(db, 'users', id);
    const cleanData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    await updateDoc(ref, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteUser(id: string) {
    const ref = doc(db, 'users', id);
    await deleteDoc(ref);
  },

  subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      callback(users);
    });
    return unsubscribe;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },
};