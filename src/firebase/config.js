
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH4lFLNHsxVPk2Ripx9t4XqRrO6i6bK34",
  authDomain: "production-5766f.firebaseapp.com",
  databaseURL: "https://production-5766f-default-rtdb.firebaseio.com",
  projectId: "production-5766f",
  storageBucket: "production-5766f.firebasestorage.app",
  messagingSenderId: "185384717449",
  appId: "1:185384717449:web:1b25ae0b1cdec3e8a2ca58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Realtime Database
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
