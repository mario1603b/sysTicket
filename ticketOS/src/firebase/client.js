import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sustituye con las credenciales de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2jwIAXbafENVG5SLfKAVry7bYXup0CKg",
  authDomain: "systicket-83627.firebaseapp.com",
  projectId: "systicket-83627",
   storageBucket: "systicket-83627.firebasestorage.app",
  messagingSenderId: "637194630640",
  appId: "1:637194630640:web:72c6777ce8f207bed55935"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);