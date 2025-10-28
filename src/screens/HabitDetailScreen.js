// src/screens/HabitDetailScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import ProgressBar from "../components/ProgressBar";
import { globalStyles } from "../styles/globalStyles";

export default function HabitDetailScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { habitId } = route.params;

  const [habit, setHabit] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar datos del hábito
  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const habitRef = doc(db, "users", user.uid, "habits", habitId);
        const habitSnap = await getDoc(habitRef);
        if (habitSnap.exists()) {
          setHabit({ id: habitSnap.id, ...habitSnap.data() });
          // cargar progreso
          await fetchProgress(habitId);
        } else {
          Alert.alert("Error", "El hábito no existe.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error al cargar hábito:", error);
        Alert.alert("Error", "No se pudo cargar el hábito.");
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [habitId]);

  // Cargar progreso semanal desde subcolección "logs"
  const fetchProgress = async (id) => {
    try {
      const logsRef = collection(db, "users", user.uid, "habits", id, "logs");
      const logsSnap = await getDocs(logsRef);

      const total = logsSnap.size;
      const completed = logsSnap.docs.filter(
        (doc) => doc.data().completed
      ).length;
      const percentage = total > 0 ? completed / total : 0;

      setProgress(percentage);
    } catch (error) {
      console.error("Error al obtener progreso:", error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Eliminar hábito",
      "¿Seguro que deseas eliminar este hábito? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const habitRef = doc(db, "users", user.uid, "habits", habitId);
              await deleteDoc(habitRef);
              Alert.alert("Eliminado", "El hábito ha sido eliminado.");
              navigation.goBack();
            } catch (error) {
              console.error("Error eliminando hábito:", error);
              Alert.alert("Error", "No se pudo eliminar el hábito.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          globalStyles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>Cargando...</Text>
      </View>
    );
  }

  if (!habit) return null;

  return (
    <ScrollView
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={[styles.emoji, { color: habit.color }]}>
          {habit.emoji}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {habit.name}
        </Text>
      </View>

      {/* Progreso */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Progreso semanal
        </Text>
        <ProgressBar progress={progress} color={habit.color} />
        <Text style={[styles.percent, { color: theme.colors.text }]}>
          {(progress * 100).toFixed(0)}%
        </Text>
      </View>

      {/* Frecuencia */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Días de la semana
        </Text>
        <View style={styles.daysRow}>
          {habit.frequency.map((d) => (
            <View
              key={d}
              style={[
                styles.dayCircle,
                { backgroundColor: habit.color, borderColor: habit.color },
              ]}
            >
              <Text style={styles.dayText}>{"LMXJVSD"[d]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Veces por día */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Veces por día:{" "}
          <Text style={{ fontWeight: "bold" }}>{habit.timesPerDay}</Text>
        </Text>
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Recordatorios: {habit.notifications ? "Activados" : "Desactivados"}
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: habit.color, flex: 1 },
          ]}
          onPress={() => navigation.navigate("HabitEdit", { habitId })}
        >
          <Text style={globalStyles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: "#E74C3C", flex: 1, marginLeft: 5 },
          ]}
          onPress={handleDelete}
        >
          <Text style={globalStyles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  percent: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  dayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
