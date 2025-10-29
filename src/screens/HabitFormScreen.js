import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { doc, collection, addDoc } from "firebase/firestore";
import { globalStyles } from "../styles/globalStyles";

import HabitFormField from "../components/HabitFormField";
import ColorSelector from "../components/ColorSelector";
import DaySelector from "../components/DaySelector";
import CounterInput from "../components/CounterInput";

const presetColors = [
  "#542AB4",
  "#4A3FB2",
  "#4054B0",
  "#3679AE",
  "#2C8EAC",
  "#22A3AA",
  "#1AA59E",
  "#12A692",
  "#0AA686",
  "#08A177",
  "#1F8E66",
  "#357B56",
  "#4A6846",
  "#605636",
  "#764326",
  "#8C3116",
  "#A21E06",
  "#FD1900",
];

const emojiOptions = [
  "💧",
  "📖",
  "🏃‍♂️",
  "🧘‍♀️",
  "🍎",
  "🛏️",
  "🧠",
  "☀️",
  "🚭",
  "👨‍💻",
  "🎨",
  "🎵",
  "🌿",
  "🚴‍♀️",
  "🍳",
  "✈️",
  "💤",
  "💡",
  "🎉",
  "🧴",
  "🎮",
  "📵",
  "📝",
  "📅",
  "🚿",
  "🕯️",
  "🧰",
  "📈",
  "🎁",
  "🪴",
];

const days = ["L", "M", "Mi", "J", "V", "S", "D"];

export default function HabitFormScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState(presetColors[0]);
  const [emoji, setEmoji] = useState("💧");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        frequency: frequency.map((i) => days[i]),
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
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Selector de emoji limpio */}
        <HabitFormField theme={theme}>
          <TouchableOpacity
            style={[
              globalStyles.emojiCircle,
              { backgroundColor: color, borderColor: theme.colors.border },
            ]}
            onPress={() => setShowEmojiPicker(true)}
          >
            <Text style={{ fontSize: 70 }}>{emoji}</Text>
          </TouchableOpacity>
          <Text
            style={[
              globalStyles.label,
              { color: theme.colors.text },
              { marginTop: 15 },
              { marginBottom: 15 },
              { alignSelf: "center" },
            ]}
          >
            Selecciona un ícono
          </Text>
        </HabitFormField>

        {/* Modal de selección de emoji */}
        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <View style={globalStyles.modalContainer}>
            <View
              style={[
                globalStyles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={[globalStyles.modalTitle, { color: theme.colors.text }]}>
                Selecciona un ícono
              </Text>
              <FlatList
                data={emojiOptions}
                numColumns={5}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={globalStyles.emojiOption}
                    onPress={() => {
                      setEmoji(item);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Nombre */}
        <HabitFormField label="Nombre del hábito" theme={theme}>
          <TextInput
            style={[
              globalStyles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor:
                  theme.mode === "dark" ? theme.colors.surface : "#FFFFFF",
              },
            ]}
            placeholder="Ejemplo: Leer 10 páginas"
            placeholderTextColor={theme.colors.placeholder}
            value={name}
            onChangeText={setName}
          />
        </HabitFormField>

        {/* Color */}
        <HabitFormField label="Color del hábito" theme={theme}>
          <ColorSelector
            colors={presetColors}
            selected={color}
            onSelect={setColor}
            theme={theme}
          />
        </HabitFormField>

        {/* Días */}
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

        {/* Recordatorios */}
        <View style={[globalStyles.row, { marginTop: 15 }]}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Activar recordatorios
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: theme.colors.secondary }}
            thumbColor="#fff"
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        {/* Guardar */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            { marginTop: 30, opacity: saving ? 0.6 : 1 },
          ]}
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

