// src/navigation/AppNavigator.js
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import HabitFormScreen from "../screens/HabitFormScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const navigationTheme = {
    dark: theme.mode === "dark",
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.secondary,
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background, text: theme.text },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: "Hoy",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                >
                  <Ionicons
                    name="settings-outline"
                    size={40}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              ),
            })}
          />

          <Stack.Screen
            name="HabitForm"
            component={HabitFormScreen}
            options={{
              title: "Nuevo hábito",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.text, // color del botón de volver
            }}
          />

          <Stack.Screen
            name="HabitDetail"
            component={require("../screens/HabitDetailScreen").default}
            options={{
              title: "Detalles del hábito",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.text, // ícono de retroceso
            }}
          />

          <Stack.Screen
            name="Settings"
            component={require("../screens/SettingsScreen").default}
            options={{
              title: "Configuración",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.text,
            }}
          />

          <Stack.Screen
            name="HabitEdit"
            component={require("../screens/HabitEditScreen").default}
            options={{
              title: "Editar hábito",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.text,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
