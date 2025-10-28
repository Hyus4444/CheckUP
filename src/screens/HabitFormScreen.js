// src/screens/HabitFormScreen.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { doc, collection, addDoc } from "firebase/firestore";
import { globalStyles } from "../styles/globalStyles";

// Componentes modulares
import HabitFormField from "../components/HabitFormField";
import ColorSelector from "../components/ColorSelector";
import DaySelector from "../components/DaySelector";
import CounterInput from "../components/CounterInput";

const presetColors = ["#02A394", "#542AB4", "#E67E22", "#3498DB", "#F1C40F", "#9B59B6", "#1ABC9C"];
const emojiOptions = ["💧", "📖", "🏃‍♂️", "🧘‍♀️", "🍎", "🛏️", "🧠", "☀️"];
const days = ["L", "M", "X", "J", "V", "S", "D"];

export default function HabitFormScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState(presetColors[0]);
  const [emoji, setEmoji] = useState(emojiOptions[0]);
  const [frequency, setFrequency] = useState([]);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [notifications, setNotifications] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleDay = (index) => {
    setFrequency((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]
    );
  };

  const incrementTimes = () => setTimesPerDay((prev) => Math.min(prev + 1, 10));
  const decrementTimes = () => setTimesPerDay((prev) => Math.max(prev - 1, 1));

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Por favor, ingresa un nombre para el hábito.");
      return;
    }
    if (frequency.length === 0) {
      Alert.alert("Error", "Selecciona al menos un día de la semana.");
      return;
    }

    setSaving(true);

    try {
      const habitData = {
        name,
        emoji,
        color,
        frequency,
        timesPerDay,
        notifications,
        completedCount: 0,
        createdAt: new Date(),
      };

      const userRef = doc(db, "users", user.uid);
      const habitsRef = collection(userRef, "habits");
      await addDoc(habitsRef, habitData);

      Alert.alert("Éxito", "¡Hábito creado correctamente!");
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar el hábito:", error);
      Alert.alert("Error", "No se pudo guardar el hábito.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[globalStyles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Título */}
        <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
          Nuevo hábito
        </Text>

        {/* Campo: Nombre */}
        <HabitFormField label="Nombre del hábito" theme={theme}>
          <TextInput
            style={[
              globalStyles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.mode === "dark" ? theme.colors.surface : "#FFFFFF",
              },
            ]}
            placeholder="Ejemplo: Leer 10 páginas"
            placeholderTextColor={theme.colors.placeholder}
            value={name}
            onChangeText={setName}
          />
        </HabitFormField>

        {/* Selección de ícono */}
        <HabitFormField label="Selecciona un ícono" theme={theme}>
          <View style={styles.emojiRow}>
            {emojiOptions.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(e)}
                style={[
                  styles.emojiCircle,
                  {
                    borderColor: e === emoji ? theme.colors.text : theme.colors.border,
                    backgroundColor: e === emoji ? theme.colors.surface : "transparent",
                  },
                ]}
              >
                <Text style={{ fontSize: 28 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </HabitFormField>

        {/* Selección de color */}
        <HabitFormField label="Selecciona un color" theme={theme}>
          <ColorSelector
            colors={presetColors}
            selected={color}
            onSelect={setColor}
            theme={theme}
          />
        </HabitFormField>

        {/* Días de la semana */}
        <HabitFormField label="Días de la semana" theme={theme}>
          <DaySelector
            days={days}
            selectedDays={frequency}
            onToggle={toggleDay}
            theme={theme}
          />
        </HabitFormField>

        {/* Veces por día */}
        <HabitFormField label="Veces por día" theme={theme}>
          <CounterInput
            value={timesPerDay}
            onIncrement={incrementTimes}
            onDecrement={decrementTimes}
            theme={theme}
          />
        </HabitFormField>

        {/* Notificaciones */}
        <View style={[styles.row, { marginTop: 15 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Activar recordatorios
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: theme.colors.secondary }}
            thumbColor="#fff"
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 30, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={globalStyles.buttonText}>
            {saving ? "Guardando..." : "Guardar hábito"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
