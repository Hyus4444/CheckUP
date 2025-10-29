// App.js
// App.js
import React, { useContext } from "react";
import "react-native-reanimated";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider, ThemeContext } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { Animated, StyleSheet } from "react-native";

//Componente envuelto para aplicar el fade de tema
function ThemedApp() {
  const { theme, fadeAnim } = useContext(ThemeContext);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          opacity: fadeAnim, 
        },
      ]}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Animated.View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
