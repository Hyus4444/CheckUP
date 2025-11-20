import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
import { BarChart } from "react-native-chart-kit";
import ProgressBar from "../components/ProgressBar";
import { Calendar } from "react-native-calendars";
import { globalStyles } from "../styles/globalStyles";

export default function HabitDetailScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { habitId } = route.params;
  const [todayProgress, setTodayProgress] = useState(0); // 0..1
  const [weeklyProgress, setWeeklyProgress] = useState(0); // 0..1
  const [weekRates, setWeekRates] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const [habit, setHabit] = useState(null);

  // Construir objeto para Calendar
  const days = ["L", "M", "Mi", "J", "V", "S", "D"];

  //calcular ancho de la ventana para el gráfico
  const SCREEN_WIDTH = Dimensions.get("window").width;

  // formato de clave para doc por día
  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useFocusEffect(
    useCallback(() => {
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

          // Formatear frecuencia manteniendo compatibilidad
          const formattedFrequency = Array.isArray(data.frequency)
            ? data.frequency.map((d) => (typeof d === "number" ? days[d] : d))
            : [];

          if (!mounted) return;

          setHabit({
            id: habitSnap.id,
            ...data,
            frequency: formattedFrequency,
            streak: data.streak || 0,
            bestStreak: data.bestStreak || 0,
          });

          // Recalcular progresos del día y semana
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
    }, [habitId])
  );

  // computeProgress lee logs y calcula todayProgress y weeklyProgress
  const computeProgress = async (id, targetTimesPerDay = 1) => {
    try {
      const logsRef = collection(db, "users", user.uid, "habits", id, "logs");
      const todayKey = getTodayKey();
      let todayCountVal = 0;
      /** ================================
       *  1. CARGAR PROGRESO DE HOY
       * ================================ */
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
        console.warn("Error obteniendo progreso del día:", err);
      }

      /** ========================================
       *  2. OBTENER LOGS DE LOS ÚLTIMOS 7 DÍAS
       * ======================================== */
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const q = query(
        logsRef,
        where("date", ">=", Timestamp.fromDate(sevenDaysAgo))
      );
      const snap = await getDocs(q);

      /** ========================================
       *  3. MAP DE FECHAS PARA CALENDARIO & BARRAS
       * ======================================== */

      const dayMap = new Map();
      snap.docs.forEach((docu) => {
        const d = docu.data();
        // Usar siempre dateKey guardado
        let key = d.dateKey;
        // Si no existe (raro), generarlo desde date con hora local
        if (!key && d.date?.toDate) {
          key = d.date.toDate().toLocaleDateString("en-CA"); // YYYY-MM-DD
        }
        if (!key) return;
        const count =
          typeof d.count === "number" ? d.count : d.completed ? 1 : 0;
        const target = d.target || targetTimesPerDay;
        const prev = dayMap.get(key);
        if (prev) {
          dayMap.set(key, { count: prev.count + count, target });
        } else {
          dayMap.set(key, { count, target });
        }
      });

      /** ===================
       *  4. CALENDARIO
       * ====================*/
      const marked = {};

      dayMap.forEach((value, key) => {
        const completionRatio = Math.min(value.count / value.target, 1);

        const colorIntensity = 255 - Math.round(completionRatio * 120);
        const bgColor =
          completionRatio > 0
            ? `${habit?.color ?? "#02A394"}${Math.floor(255 - colorIntensity)
                .toString(16)
                .padStart(2, "0")}`
            : "transparent";

        marked[key] = {
          marked: value.count > 0,
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
      /** ============================================================
       *  5. CÁLCULO PARA GRÁFICO → LUNES A DOMINGO
       * ============================================================ */
      const weekRates = [0, 0, 0, 0, 0, 0, 0]; // L, M, Mi, J, V, S, D

      dayMap.forEach((value, key) => {
        // Crear fecha asegurando uso de hora local
        const parts = key.split("-"); // YYYY-MM-DD
        const jsDate = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );

        // Día de la semana en local: 0=Dom, 1=Lun, ..., 6=Sáb
        const weekday = jsDate.getDay();

        // Ajuste de índices: lunes = 0, domingo = 6
        const adjustedIndex = weekday === 0 ? 6 : weekday - 1;

        const completionRatio = Math.min(value.count / value.target, 1);

        weekRates[adjustedIndex] = completionRatio;
      });

      /** ========================================
       *  6. PROGRESO SEMANAL (PROMEDIO)
       * ======================================== */
      const weekly =
        weekRates.reduce((sum, r) => sum + r, 0) / weekRates.length || 0;

      /** ========================================
       *  7. PROGRESO DE HOY
       * ======================================== */
      const todayProgressVal =
        targetTimesPerDay > 0
          ? Math.min(todayCountVal / targetTimesPerDay, 1)
          : 0;

      /** ========================================
       *  8. SET STATES FINALES
       * ======================================== */
      setTodayCount(todayCountVal);
      setTodayProgress(todayProgressVal);
      setWeeklyProgress(weekly);
      setWeekRates(weekRates);
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
              dotColor: habit.color,
              bgColor: theme.colors.background,
              selectedDayBackgroundColor: habit.color,
              todayTextColor: habit.color,
            }}
            markedDates={markedDates}
          />
        </View>
        {/* --- Gráfico semanal --- */}
        <View style={[globalStyles.sectionDetails, globalStyles.chartWrapper]}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Resumen semanal
          </Text>
          <View style={globalStyles.chartInner}>
            <BarChart
              data={{
                labels: ["L", "M", "Mi", "J", "V", "S", "D"],
                datasets: [
                  {
                    data:
                      weekRates.length > 0
                        ? weekRates.map((r) => Math.round(r * 100))
                        : [0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              width={Math.min(SCREEN_WIDTH - 40, 720)} // ancho controlado y responsivo
              height={300}
              fromZero={true}
              showValuesOnTopOfBars={true}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 0,
                color: () => habit.color,
                labelColor: () => theme.colors.text,
                barPercentage: 1.2,
                propsForBackgroundLines: { strokeWidth: 0 },
              }}
              style={globalStyles.barChart}
            />
          </View>
        </View>
        {/* --- Rachas (streaks) --- */}
        <View style={globalStyles.sectionDetails}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            Racha actual
          </Text>
          <Text style={[globalStyles.streakNumber, { color: habit.color }]}>
            🔥 {habit.streak || 0} día{habit.streak === 1 ? "" : "s"}
          </Text>

          <Text
            style={[
              globalStyles.label,
              { color: theme.colors.text, marginTop: 10 },
            ]}
          >
            Mejor racha
          </Text>
          <Text
            style={[globalStyles.streakNumber, { color: theme.colors.primary }]}
          >
            🏆 {habit.bestStreak || 0} día{habit.bestStreak === 1 ? "" : ""}
          </Text>
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
