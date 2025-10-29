import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HabitFormField from "../components/HabitFormField";
import CounterInput from "../components/CounterInput";
import { globalStyles } from "../styles/globalStyles";

const presetColors = [
  "#542AB4",
  "#4A3FB2",
  "#4054B0",
  "#3679AE",
  "#2C8EAC",
  "#22A3AA",
  "#1AA59E",
  "#12A692",
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

export default function HabitEditScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { habitId } = route.params;
  const [emoji, setEmoji] = useState("");
  const [habitData, setHabitData] = useState(null);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState([]);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [color, setColor] = useState("#02A394");
  const incrementTimes = () => setTimesPerDay((prev) => Math.min(prev + 1, 10));
  const decrementTimes = () => setTimesPerDay((prev) => Math.max(prev - 1, 1));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  //Cargar información del hábito existente
  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const habitRef = doc(db, "users", user.uid, "habits", habitId);
        const habitSnap = await getDoc(habitRef);

        if (habitSnap.exists()) {
          const data = habitSnap.data();
          setHabitData(data);
          setName(data.name || "");
          setFrequency(data.frequency || []);
          setTimesPerDay(data.timesPerDay || 1);
          setColor(data.color || "#02A394");
          setEmoji(data.emoji || "💧");
        } else {
          Alert.alert("Error", "No se encontró el hábito.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error cargando hábito:", error);
        Alert.alert("Error", "No se pudo cargar la información del hábito.");
      }
    };

    fetchHabit();
  }, [habitId]);

  // Actualizar hábito existente
  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert("Atención", "El nombre del hábito es obligatorio.");
      return;
    }

    try {
      const habitRef = doc(db, "users", user.uid, "habits", habitId);
      await updateDoc(habitRef, {
        name,
        frequency,
        timesPerDay,
        color,
        emoji,
      });

      Alert.alert("Éxito", "Los cambios se guardaron correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error actualizando hábito:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  };

  if (!habitData) {
    return (
      <View
        style={[
          globalStyles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>Cargando hábito...</Text>
      </View>
    );
  }

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
              <Text
                style={[globalStyles.modalTitle, { color: theme.colors.text }]}
              >
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
        <Text style={[globalStyles.label, { color: theme.colors.text }]}>
          Nombre del hábito
        </Text>
        <TextInput
          style={[
            globalStyles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Ej. Leer un libro"
          placeholderTextColor={theme.colors.border}
        />
        {/* Veces por día */}
        <HabitFormField label="Veces por día" theme={theme}>
          <CounterInput
            value={timesPerDay}
            onIncrement={incrementTimes}
            onDecrement={decrementTimes}
            theme={theme}
          />
        </HabitFormField>

        <TouchableOpacity
          style={[globalStyles.button]}
          onPress={handleSaveChanges}
        >
          <Text style={globalStyles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
