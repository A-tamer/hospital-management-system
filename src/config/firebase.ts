
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// ⚠️ Make sure these values exactly match the config from Firebase Console → Project settings → Web app
const firebaseConfig = {
  apiKey: "AIzaSyA3q3uB7hanQ3kv1HMEE-9EWI5-OSQNd9Y",
  authDomain: "hospital-management-syst-dc6d6.firebaseapp.com",
  projectId: "hospital-management-syst-dc6d6",
  // Default Storage bucket must use the appspot.com domain (copy it from Firebase Console if different)
  storageBucket: "hospital-management-syst-dc6d6.firebasestorage.app",
  messagingSenderId: "465273771737",
  appId: "1:465273771737:web:d4f1ea728f3266512e10c8",
  measurementId: "G-FQ2PBSPSEF"
};





// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// (Optional) Initialize Analytics — works only in browsers
const analytics = getAnalytics(app);

// Initialize Storage
const storage = getStorage(app);

export { app, db, analytics, storage };