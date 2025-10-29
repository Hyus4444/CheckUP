// src/navigation/AppNavigator.js
import React, { useContext } from "react";
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
import HabitEditScreen from "../screens/HabitEditScreen";
import HabitDetailScreen from "../screens/HabitDetailScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);


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
                    color={theme.colors.primary}
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
              headerTintColor: theme.colors.primary, // color del botón de volver
            }}
          />

          <Stack.Screen
            name="HabitDetail"
            component={HabitDetailScreen}
            options={{
              title: "Detalles del hábito",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.primary, 
            }}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Configuración",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.primary,
            }}
          />

          <Stack.Screen
            name="HabitEdit"
            component={HabitEditScreen}
            options={{
              title: "Editar hábito",
              headerTitleAlign: "right",
              headerStyle: { backgroundColor: theme.colors.background },
              headerTitleStyle: {
                color: theme.colors.primary,
                fontSize: 35,
                fontWeight: "600",
              },
              headerTintColor: theme.colors.primary,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
