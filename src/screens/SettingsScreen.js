import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { globalStyles } from "../styles/globalStyles";

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  // Manejar cierre de sesión
  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: logout,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/*Opción de cambio de tema */}
      <View style={styles.optionRow}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Tema oscuro
        </Text>
        <Switch
          value={isDark} 
          onValueChange={toggleTheme}
          thumbColor={isDark ? "#02A394" : "#f4f3f4"}
          trackColor={{ false: "#ccc", true: "#02A39477" }}
        />
      </View>

      {/*Botón de cerrar sesión */}
      <TouchableOpacity
        style={[
          globalStyles.button,
          { backgroundColor: "#E74C3C", marginTop: 40 },
        ]}
        onPress={handleLogout}
      >
        <Text style={globalStyles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 5,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
