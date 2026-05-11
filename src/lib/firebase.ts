import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDDTY-MpXbdzUMeFquwmlKVtx_v7WarWaQ",
  authDomain: "grindtable-75a84.firebaseapp.com",
  projectId: "grindtable-75a84",
  storageBucket: "grindtable-75a84.firebasestorage.app",
  messagingSenderId: "936431247285",
  appId: "1:936431247285:web:c06c5d765416081eb803fc",
  measurementId: "G-G2B0F4T6ZW"
};

// Initialize Firebase safely
const app = firebaseConfig.apiKey ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const db = app ? getFirestore(app) : null;

export { app, db };
