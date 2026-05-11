import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG HERE
  apiKey: "",
  authDomain: "grindtable-app.firebaseapp.com",
  projectId: "grindtable-app",
  storageBucket: "grindtable-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase safely
const app = firebaseConfig.apiKey ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const db = app ? getFirestore(app) : null;

export { app, db };
