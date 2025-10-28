import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../styles/theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("themeMode");
      if (saved === "dark") {
        setIsDark(true);
        setTheme(darkTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    if (isDark) {
      setIsDark(false);
      setTheme(lightTheme);
      await AsyncStorage.setItem("themeMode", "light");
    } else {
      setIsDark(true);
      setTheme(darkTheme);
      await AsyncStorage.setItem("themeMode", "dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

