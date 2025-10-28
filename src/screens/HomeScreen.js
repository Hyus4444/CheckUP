// src/screens/HomeScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { globalStyles } from "../styles/globalStyles";
import { db } from "../services/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// Componentes reutilizables
import FloatingButton from "../components/FloatingButton";
import HabitCard from "../components/HabitCard";
import HeaderTitle from "../components/HeaderTitle";

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const motivationalPhrases = [
    "¡Sigue así, vas por buen camino! 💪",
    "¡Excelente trabajo, un paso más hacia tu meta! 🚀",
    "¡La constancia es tu mejor aliada! 🌟",
    "¡Orgulloso de ti, sigue avanzando! 🔥",
  ];

  // Cargar hábitos en tiempo real
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const habitsRef = collection(userRef, "habits");

    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const fetchedHabits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(fetchedHabits);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Manejar hábito completado
  const handleCompleteHabit = async (habitId) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const habitDoc = doc(userRef, "habits", habitId);
      const currentData = await getDoc(habitDoc);
      const currentCount = currentData.exists()
        ? currentData.data().completedCount || 0
        : 0;

      await updateDoc(habitDoc, { completedCount: currentCount + 1 });

      const randomPhrase =
        motivationalPhrases[
          Math.floor(Math.random() * motivationalPhrases.length)
        ];

      Alert.alert("¡Buen trabajo!", randomPhrase);
    } catch (error) {
      console.error("Error al actualizar hábito:", error);
    }
  };

  // Fecha actual
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: theme.colors.background, paddingTop: 20 },
      ]}
    >
      {/* Encabezado */}
      <HeaderTitle title="Hoy" subtitle={formattedDate} theme={theme} />

      {/* Lista de hábitos */}
      {loading ? (
        <Text style={{ color: theme.colors.text, textAlign: "center" }}>
          Cargando hábitos...
        </Text>
      ) : habits.length === 0 ? (
        <Text style={{ color: theme.colors.text, textAlign: "center" }}>
          Aún no has creado hábitos.
        </Text>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard item={item} onPress={handleCompleteHabit} theme={theme} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botón flotante */}
      <FloatingButton
        onPress={() => navigation.navigate("HabitForm")}
        color={theme.colors.secondary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
