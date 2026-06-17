import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBH4lFLNHsxVPk2Ripx9t4XqRrO6i6bK34",
  authDomain: "production-5766f.firebaseapp.com",
  databaseURL: "https://production-5766f-default-rtdb.firebaseio.com",
  projectId: "production-5766f",
  storageBucket: "production-5766f.firebasestorage.app",
  messagingSenderId: "185384717449",
  appId: "1:185384717449:web:1b25ae0b1cdec3e8a2ca58"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;