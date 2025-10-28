// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAB8_UleXlFaGiOMlKzQWBAIcAlfutpHSs",
  authDomain: "checkup-81e93.firebaseapp.com",
  projectId: "checkup-81e93",
  storageBucket: "checkup-81e93.firebasestorage.app",
  messagingSenderId: "496360318897",
  appId: "1:496360318897:web:138afc0ff6d18e1829bf90",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
