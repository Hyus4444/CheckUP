// src/screens/HabitDetailScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
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
  query,
  where,
  Timestamp,
  doc as docRef,
  getDocFromCache,
} from "firebase/firestore";
import ProgressBar from "../components/ProgressBar";
import { Calendar } from "react-native-calendars";
import { globalStyles } from "../styles/globalStyles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOTTOM_BUTTONS_HEIGHT = 84; // ajuste: espacio reservado para botones fijos

export default function HabitDetailScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { habitId } = route.params;

  const [habit, setHabit] = useState(null);
  const [todayProgress, setTodayProgress] = useState(0); // 0..1
  const [weeklyProgress, setWeeklyProgress] = useState(0); // 0..1
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  // Construir objeto para Calendar

  const days = ["L", "M", "Mi", "J", "V", "S", "D"];

  // formato de clave para doc por día (consistente con HomeScreen)
  const getTodayKey = () => {
    const now = new Date();
    const M = now.getMonth() + 1;
    return `${now.getFullYear()}-${M}-${now.getDate()}`;
  };

  useEffect(() => {
    let mounted = true;

    const fetchHabitData = async () => {
      try {
        const habitRef = doc(db, "users", user.uid, "habits", habitId);
        const habitSnap = await getDoc(habitRef);

        if (!habitSnap.exists()) {
          Alert.alert("Error", "El hábito no existe.");
          navigation.goBack();
          return;
        }

        const data = habitSnap.data();
        const formattedFrequency = Array.isArray(data.frequency)
          ? data.frequency.map((d) => (typeof d === "number" ? days[d] : d))
          : [];

        if (!mounted) return;
        setHabit({ id: habitSnap.id, ...data, frequency: formattedFrequency });

        // calcular progreso del día y de la semana
        await computeProgress(habitId, data.timesPerDay || 1);
      } catch (error) {
        console.error("Error al cargar hábito:", error);
        Alert.alert("Error", "No se pudo cargar la información del hábito.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHabitData();

    return () => {
      mounted = false;
    };
  }, [habitId]);

  // computeProgress lee logs y calcula todayProgress y weeklyProgress
  const computeProgress = async (id, targetTimesPerDay = 1) => {
    try {
      const logsRef = collection(db, "users", user.uid, "habits", id, "logs");

      // 1) obtener log de hoy. Soportamos dos esquemas:
      // - documento con id = todayKey (setDoc(doc(logsRef, todayKey), {...}))
      // - documento con campo dateKey == todayKey
      const todayKey = getTodayKey();
      let todayCountVal = 0;

      // intentar obtener doc con id = todayKey
      try {
        const todayDocRef = docRef(
          db,
          "users",
          user.uid,
          "habits",
          id,
          "logs",
          todayKey
        );
        const todaySnap = await getDoc(todayDocRef);
        if (todaySnap.exists()) {
          const d = todaySnap.data();
          todayCountVal =
            typeof d.count === "number"
              ? d.count
              : d.completed
              ? d.count || 1
              : 0;
        } else {
          // fallback: búsqueda por campo dateKey
          const q1 = query(logsRef, where("dateKey", "==", todayKey));
          const snap1 = await getDocs(q1);
          if (!snap1.empty) {
            const d = snap1.docs[0].data();
            todayCountVal =
              typeof d.count === "number"
                ? d.count
                : d.completed
                ? d.count || 1
                : 0;
          }
        }
      } catch (err) {
        console.warn(
          "No se obtuvo doc by id for todayKey, buscando por campo...",
          err
        );
        const q1 = query(logsRef, where("dateKey", "==", todayKey));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          const d = snap1.docs[0].data();
          todayCountVal =
            typeof d.count === "number"
              ? d.count
              : d.completed
              ? d.count || 1
              : 0;
        }
      }

      // 2) calcular progreso semanal: obtener logs >= sevenDaysAgo
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // últimos 7 días (incluye hoy)
      const q = query(
        logsRef,
        where("date", ">=", Timestamp.fromDate(sevenDaysAgo))
      );
      const snap = await getDocs(q);

      // construimos un map dateKey -> {count, target}
      const dayMap = new Map();
      const marked = {};
      dayMap.forEach((value, key) => {
        marked[key] = {
          marked: true,
          dotColor: habit.color,
          selected: value.count >= value.target,
          selectedColor: habit.color,
        };
      });
      setMarkedDates(marked);
      snap.docs.forEach((docu) => {
        const d = docu.data();
        // dateKey preferido, si no, extraer ISO date de timestamp
        const key =
          d.dateKey ||
          (d.date &&
            d.date.toDate &&
            d.date.toDate().toISOString().split("T")[0]) ||
          null;
        if (!key) return;
        const count = typeof d.count === "number" ? d.count : d.count ? 1 : 0;
        const target = d.target || targetTimesPerDay;
        // si hay varios logs para el mismo día, acumulamos (por si acaso)
        const prev = dayMap.get(key);
        if (prev) {
          dayMap.set(key, { count: prev.count + count, target });
        } else {
          dayMap.set(key, { count, target });
        }
      });

      // asegurar que consideramos 7 días (incluir días sin registro con count=0)
      const rates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const rec = dayMap.get(key);
        const count = rec ? rec.count : 0;
        const target = rec ? rec.target : targetTimesPerDay;
        const rate = target > 0 ? Math.min(count / target, 1) : 0;
        rates.push(rate);
      }

      const weekly = rates.reduce((s, r) => s + r, 0) / 7;
      const todayProgressVal =
        targetTimesPerDay > 0
          ? Math.min(todayCountVal / targetTimesPerDay, 1)
          : 0;

      setTodayCount(todayCountVal);
      setTodayProgress(todayProgressVal);
      setWeeklyProgress(weekly);
    } catch (error) {
      console.error("Error calculando progreso:", error);
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
    <View
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: BOTTOM_BUTTONS_HEIGHT + 20 }}
      >
        {/* Encabezado */}
        <View style={globalStyles.header}>
          <Text style={[globalStyles.emojiDetails, { color: habit.color }]}>
            {habit.emoji}
          </Text>
          <Text style={[globalStyles.titleWhite, { color: theme.colors.text }]}>
            {habit.name}
          </Text>
        </View>

        {/* --- Hoy: barra principal (progreso del día) --- */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Progreso hoy
          </Text>
          <ProgressBar progress={todayProgress} color={habit.color} />
          <Text style={[globalStyles.percent, { color: theme.colors.text }]}>
            {Math.round(todayProgress * 100)}% • {todayCount}/
            {habit.timesPerDay}
          </Text>
        </View>

        {/* --- Progreso semanal (resumen) --- */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Progreso semanal
          </Text>
          <ProgressBar progress={weeklyProgress} color={habit.color} />
          <Text style={[globalStyles.percent, { color: theme.colors.text }]}>
            {Math.round(weeklyProgress * 100)}%
          </Text>
        </View>
        {/* Frecuencia */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Días de la semana
          </Text>
          <View style={globalStyles.daysRow}>
            {habit.frequency.map((day, index) => (
              <View
                key={index}
                style={[
                  globalStyles.dayCircle,
                  { backgroundColor: habit.color, borderColor: habit.color },
                ]}
              >
                <Text style={globalStyles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Veces por día */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Veces por día:{" "}
            <Text style={globalStyles.label}>{habit.timesPerDay}</Text>
          </Text>
        </View>

        {/* Notificaciones */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Recordatorios: {habit.notifications ? "Activados" : "Desactivados"}
          </Text>
        </View>
        {/* --- Calendario de progreso --- */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Historial de progreso
          </Text>

          <Calendar
            style={globalStyles.calendar}
            theme={{
              backgroundColor: theme.colors.background,
              calendarBackground: theme.colors.background,
              dayTextColor: theme.colors.text,
              monthTextColor: theme.colors.text,
              arrowColor: habit.color,
              selectedDayBackgroundColor: habit.color,
              todayTextColor: habit.color,
            }}
            markedDates={markedDates}
          />
        </View>
      </ScrollView>

      {/* Botones fijos en la parte inferior */}
      <View
        style={[
          globalStyles.bottomButtonsContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: habit.color, flex: 1, marginRight: 8 },
          ]}
          onPress={() => navigation.navigate("HabitEdit", { habitId })}
        >
          <Text style={globalStyles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: "#E74C3C", flex: 1, marginLeft: 8 },
          ]}
          onPress={handleDelete}
        >
          <Text style={globalStyles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
