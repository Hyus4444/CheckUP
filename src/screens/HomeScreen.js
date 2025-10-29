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
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
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
          const allHabits = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

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
        <Text style={[globalStyles.label, {color:theme.colors.text}]}>
          No tienes hábitos programados para hoy.
        </Text>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabit}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingButton
        onPress={() => navigation.navigate("HabitForm")}
        color={theme.colors.primary}
      />
    </View>
  );
}


