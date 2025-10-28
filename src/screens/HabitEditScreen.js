// src/screens/HabitEditScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { globalStyles } from "../styles/globalStyles";

export default function HabitEditScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { habitId } = route.params;

  const [habitData, setHabitData] = useState(null);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState([]);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [color, setColor] = useState("#02A394");

  // 🔹 Cargar información del hábito existente
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

  // 🔹 Actualizar hábito existente
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
    <ScrollView
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
        Editar hábito
      </Text>

      <Text style={[styles.label, { color: theme.colors.text }]}>
        Nombre del hábito
      </Text>
      <TextInput
        style={[
          styles.input,
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

      <Text style={[styles.label, { color: theme.colors.text }]}>
        Veces por día: {timesPerDay}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
          style={styles.adjustBtn}
        >
          <Text style={{ color: theme.colors.primary }}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTimesPerDay(timesPerDay + 1)}
          style={styles.adjustBtn}
        >
          <Text style={{ color: theme.colors.primary }}>＋</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleSaveChanges}
      >
        <Text style={globalStyles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    gap: 15,
  },
  adjustBtn: {
    padding: 10,
  },
});
