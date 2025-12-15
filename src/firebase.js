// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR CONFIG HERE (From Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNvB9tzQNz0jyU5CQPB1okUKL2FYiqXjw",
  authDomain: "parishcalendar-42153.firebaseapp.com",
  projectId: "parishcalendar-42153",
  storageBucket: "parishcalendar-42153.firebasestorage.app",
  messagingSenderId: "975125126256",
  appId: "1:975125126256:web:6c9530a89843da5714e8b5",
  measurementId: "G-PFV3FFTQHZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);