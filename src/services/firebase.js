import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAB8_UleXlFaGiOMlKzQWBAIcAlfutpHSs",
  authDomain: "checkup-81e93.firebaseapp.com",
  projectId: "checkup-81e93",
  storageBucket: "checkup-81e93.firebasestorage.app",
  messagingSenderId: "496360318897",
  appId: "1:496360318897:web:138afc0ff6d18e1829bf90",
};

// Inicializa la app
const app = initializeApp(firebaseConfig);

// Inicializa Auth con persistencia nativa
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Inicializa Firestore
const db = getFirestore(app);

export { app, auth, db };



