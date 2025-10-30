import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc as docRef,
} from "firebase/firestore";
import ProgressBar from "../components/ProgressBar";
import { Calendar } from "react-native-calendars";
import { globalStyles } from "../styles/globalStyles";

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

            const marked = {};
            Object.entries(dayMap).forEach(([date, value]) => {
              const completionRatio = value.count / value.target; // entre 0 y 1

              // Escala de intensidad: más claro = menos completado
              const colorIntensity = Math.min(
                255,
                255 - Math.round(completionRatio * 120)
              );
              const bgColor =
                completionRatio > 0
                  ? `${habit.color}${Math.floor(255 - colorIntensity)
                      .toString(16)
                      .padStart(2, "0")}`
                  : "transparent";

              marked[date] = {
                marked: value.count > 0,
                dotColor: habit.color,
                selected: completionRatio >= 1,
                selectedColor: bgColor,
                customStyles: {
                  container: {
                    backgroundColor: bgColor,
                    borderRadius: 6,
                  },
                  text: {
                    color: completionRatio > 0.5 ? "#fff" : theme.colors.text,
                    fontWeight: completionRatio >= 1 ? "700" : "500",
                  },
                },
              };
            });

            setMarkedDates(marked);
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

      //calcular progreso semanal: obtener logs >= sevenDaysAgo
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); 
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

      // asegurar que se consideran los 7 días (se incluyen días sin registro)
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView>
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
          <Text
            style={[globalStyles.percentText, { color: theme.colors.text }]}
          >
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
          <Text
            style={[globalStyles.percentText, { color: theme.colors.text }]}
          >
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
            Recordatorios:{" "}
            {habit.notifications ? "Activadas 🔔" : "Desactivadas 🔕"}
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
          style={[globalStyles.button, { backgroundColor: habit.color }]}
          onPress={() => navigation.navigate("HabitEdit", { habitId })}
        >
          <Text style={globalStyles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
