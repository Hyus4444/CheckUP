import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { motivationalPhrases } from "../data/motivationalPhrases";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import FloatingButton from "../components/FloatingButton";
import ProgressBar from "../components/ProgressBar";
import HabitItem from "../components/HabitItem";
import { globalStyles } from "../styles/globalStyles";

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [habitLogs, setHabitLogs] = useState({});

  //Obtener clave única del día
  const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  const styles = StyleSheet.create({});
  const getCurrentDayIndex = () => {
    const jsDay = new Date().getDay();
    const dayMap = ["D", "L", "M", "Mi", "J", "V", "S"];
    return dayMap[jsDay];
  };
  // Cargar hábitos del día actual
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHabits = async () => {
        setLoading(true);
        try {
          const habitsRef = collection(db, "users", user.uid, "habits");
          const snapshot = await getDocs(habitsRef);
          const allHabits = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              ...data,
              // Asegurar que frequency SIEMPRE sea un array
              frequency: Array.isArray(data.frequency) ? data.frequency : [],
            };
          });

          const todayIndex = getCurrentDayIndex();
          const todayHabits = allHabits.filter((habit) =>
            habit.frequency?.includes(todayIndex)
          );

          if (isActive) {
            setHabits(todayHabits);
            await fetchTodayLogs(todayHabits);
          }
        } catch (error) {
          console.error("Error al cargar hábitos:", error);
          Alert.alert("Error", "No se pudieron cargar los hábitos.");
        } finally {
          setLoading(false);
        }
      };

      fetchHabits();
      return () => {
        isActive = false;
      };
    }, [user])
  );

  // Obtener logs de hoy
  const fetchTodayLogs = async (todayHabits) => {
    const todayKey = getTodayKey();
    const logsByHabit = {};

    for (const habit of todayHabits) {
      const logsRef = collection(
        db,
        "users",
        user.uid,
        "habits",
        habit.id,
        "logs"
      );
      const q = query(logsRef, where("dateKey", "==", todayKey));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        logsByHabit[habit.id] = data.count || 0;
      } else {
        logsByHabit[habit.id] = 0;
      }
    }

    setHabitLogs(logsByHabit);
    calculateProgress(todayHabits, logsByHabit);
  };

  // Calcular progreso global del día
  const calculateProgress = (todayHabits, logsByHabit) => {
    if (todayHabits.length === 0) return setProgress(0);

    let total = 0;
    let completed = 0;

    todayHabits.forEach((habit) => {
      const count = logsByHabit[habit.id] || 0;
      const ratio = Math.min(count / habit.timesPerDay, 1);
      completed += ratio;
      total += 1;
    });

    setProgress(total ? completed / total : 0);
  };

  // Incrementar conteo de veces completadas
  const handleToggleHabit = async (habit) => {
    try {
      const todayKey = getTodayKey();
      const habitRef = doc(db, "users", user.uid, "habits", habit.id);
      const logsRef = collection(habitRef, "logs");

      const currentCount = habitLogs[habit.id] || 0;
      const newCount = currentCount < habit.timesPerDay ? currentCount + 1 : 0; // reset si supera el límite

      await updateDoc(habitRef, { completedCount: newCount });
      if (currentCount < habit.timesPerDay && newCount === habit.timesPerDay) {
        const randomPhrase =
          motivationalPhrases[
            Math.floor(Math.random() * motivationalPhrases.length)
          ];

        Alert.alert(randomPhrase);
      }

      const logData = {
        date: Timestamp.fromDate(new Date()),
        dateKey: todayKey,
        count: newCount,
      };

      await setDoc(doc(logsRef, todayKey), logData); // clave fija por día
      await updateDoc(habitRef, { completedCount: newCount });

      const updatedLogs = { ...habitLogs, [habit.id]: newCount };
      setHabitLogs(updatedLogs);
      calculateProgress(habits, updatedLogs);
    } catch (error) {
      console.error("Error al actualizar hábito:", error);
      Alert.alert("Error", "No se pudo actualizar el hábito.");
    }
    // =============================
    // CÁLCULO DE RACHAS (STREAKS)
    // =============================
    const habitDoc = await getDoc(habitRef);
    const habitInfo = habitDoc.data();
    let currentStreak = habitInfo.streak || 0;
    let bestStreak = habitInfo.bestStreak || 0;
    // 1. Ver si HOY ya está completado
    const isTodayComplete = newCount >= habit.timesPerDay;
    // 2. Obtener AYER
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const year = yesterdayDate.getFullYear();
    const month = String(yesterdayDate.getMonth() + 1).padStart(2, "0");
    const day = String(yesterdayDate.getDate()).padStart(2, "0");
    const yesterdayKey = `${year}-${month}-${day}`;
    // 3. Buscar progreso de AYER
    const yesterdayRef = doc(
      db,
      "users",
      user.uid,
      "habits",
      habit.id,
      "logs",
      yesterdayKey
    );
    const yesterdaySnap = await getDoc(yesterdayRef);
    let wasYesterdayComplete = false;
    if (yesterdaySnap.exists()) {
      const yData = yesterdaySnap.data();
      const yCount = yData.count || 0;
      wasYesterdayComplete = yCount >= habit.timesPerDay;
    }
    // 4. Calcular nueva racha
    let newStreak = 0;
    if (isTodayComplete) {
      newStreak = wasYesterdayComplete ? currentStreak + 1 : 1;
    } else {
      newStreak = 0;
    }
    // 5. Actualizar best streak
    const newBestStreak = Math.max(bestStreak, newStreak);
    // 6. Guardar en Firestore
    await updateDoc(habitRef, {
      streak: newStreak,
      bestStreak: newBestStreak,
    });
  };

  // Renderizar cada hábito
  const renderHabit = ({ item }) => {
    const count = habitLogs[item.id] || 0;
    const ratio = count / item.timesPerDay;

    return (
      <HabitItem
        item={item}
        theme={theme}
        isCompleted={ratio >= 1}
        progress={ratio}
        count={count}
        target={item.timesPerDay}
        onToggle={() => handleToggleHabit(item)}
        onOpen={(habit) =>
          navigation.navigate("HabitDetail", { habitId: habit.id })
        }
      />
    );
  };

  return (
    <View
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
        Tu progreso diario
      </Text>
      <ProgressBar progress={progress} color={theme.colors.secondary} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : habits.length === 0 ? (
        <Text style={[globalStyles.label, { color: theme.colors.text }]}>
          No tienes hábitos programados para hoy.
        </Text>
      ) : (
        <View style={{ flex: 1, marginTop: 15 }}>
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabit}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <FloatingButton
        onPress={() => navigation.navigate("HabitForm")}
        color={theme.colors.primary}
      />
    </View>
  );
}
