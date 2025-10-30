import { lightTheme, darkTheme } from "../styles/theme";
import React, { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Animated, Easing } from "react-native";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const ThemeContext = createContext();


export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  const fadeAnim = useRef(new Animated.Value(1)).current; // para el efecto

  const db = getFirestore();
  const auth = getAuth();

  //Cargar tema desde AsyncStorage o Firestore
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const local = await AsyncStorage.getItem("themeMode");

        // Si hay usuario autenticado, prioriza Firestore
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().theme) {
            const saved = userSnap.data().theme;
            applyTheme(saved);
            await AsyncStorage.setItem("themeMode", saved);
            return;
          }
        }

        // Si no hay Firestore, usa el local
        applyTheme(local || "light");
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Función para aplicar tema con animación
  const applyTheme = (mode) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      if (mode === "dark") {
        setTheme(darkTheme);
        setIsDark(true);
      } else {
        setTheme(lightTheme);
        setIsDark(false);
      }

      // Fade-in al terminar cambio
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    });
  };

  // 🔹 Alternar tema con persistencia local + remota
  const toggleTheme = async () => {
    const newMode = isDark ? "light" : "dark";
    applyTheme(newMode);

    // Guardar en AsyncStorage
    await AsyncStorage.setItem("themeMode", newMode);

    // Guardar en Firestore (si hay usuario)
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { theme: newMode });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, fadeAnim }}>
      {children}
    </ThemeContext.Provider>
  );
};
