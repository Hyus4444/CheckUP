import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // 👈 importante
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { globalStyles } from "../styles/globalStyles";
import FloatingButton from "../components/FloatingButton";
import ProgressBar from "../components/ProgressBar";
import HabitItem from "../components/HabitItem";

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedHabits, setCompletedHabits] = useState({});

  const getTodayKey = () => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();
  };

  // 🔹 Cargar hábitos cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHabits = async () => {
        setLoading(true);
        try {
          const habitsRef = collection(db, "users", user.uid, "habits");
          const snapshot = await getDocs(habitsRef);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (isActive) {
            setHabits(data);

            // Cargar logs de hoy
            const todayKey = getTodayKey();
            const logsByHabit = {};
            for (const habit of data) {
              const logsRef = collection(
                db,
                "users",
                user.uid,
                "habits",
                habit.id,
                "logs"
              );
              const q = query(
                logsRef,
                where("dateKey", "==", todayKey),
                where("completed", "==", true)
              );
              const logsSnap = await getDocs(q);
              logsByHabit[habit.id] = !logsSnap.empty;
            }

            setCompletedHabits(logsByHabit);
            calculateProgress(logsByHabit);
          }
        } catch (error) {
          console.error("Error al cargar hábitos:", error);
          Alert.alert("Error", "No se pudieron cargar los hábitos.");
        } finally {
          setLoading(false);
        }
      };

      fetchHabits();

      // Limpieza cuando se desmonta
      return () => {
        isActive = false;
      };
    }, [user])
  );

  const calculateProgress = (logsByHabit) => {
    const total = Object.keys(logsByHabit).length;
    const completed = Object.values(logsByHabit).filter(Boolean).length;
    setProgress(total ? completed / total : 0);
  };

  const handleToggleHabit = async (habit) => {
    try {
      const todayKey = getTodayKey();
      const habitRef = doc(db, "users", user.uid, "habits", habit.id);
      const logsRef = collection(habitRef, "logs");

      if (completedHabits[habit.id]) {
        // Desmarcar: eliminar log del día
        const q = query(logsRef, where("dateKey", "==", todayKey));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => await deleteDoc(doc(logsRef, d.id)));

        await updateDoc(habitRef, {
          completedCount: Math.max((habit.completedCount || 1) - 1, 0),
        });

        setCompletedHabits((prev) => ({ ...prev, [habit.id]: false }));
      } else {
        // Marcar: agregar log
        const logData = {
          date: Timestamp.fromDate(new Date()),
          dateKey: todayKey,
          completed: true,
        };
        await addDoc(logsRef, logData);

        await updateDoc(habitRef, {
          completedCount: (habit.completedCount || 0) + 1,
        });

        setCompletedHabits((prev) => ({ ...prev, [habit.id]: true }));
      }

      calculateProgress({
        ...completedHabits,
        [habit.id]: !completedHabits[habit.id],
      });
    } catch (error) {
      console.error("Error al actualizar hábito:", error);
      Alert.alert("Error", "No se pudo actualizar el hábito.");
    }
  };

  const renderHabit = ({ item }) => (
    <HabitItem
      item={item}
      theme={theme}
      isCompleted={!!completedHabits[item.id]}
      onToggle={() => handleToggleHabit(item)}
      onOpen={(habit) =>
        navigation.navigate("HabitDetail", { habitId: habit.id })
      }
    />
  );

  return (
    <View
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ProgressBar progress={progress} color={theme.colors.secondary} />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : habits.length === 0 ? (
        <Text style={{ color: theme.colors.text, marginTop: 20 }}>
          Aún no tienes hábitos registrados.
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

const styles = StyleSheet.create({});
