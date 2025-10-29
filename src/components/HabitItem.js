import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { bouncePress } from "../utils/animations";

export default function HabitItem({
  item,
  theme,
  progress = 0,
  count = 0,
  target = 1,
  onToggle,
  onOpen,
}) {
  const scale = useSharedValue(1);

  // Animación del rebote
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Animación de progreso
  const progressWidth = useSharedValue(progress);

  React.useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 400 });
  }, [progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressWidth.value * 100, 100)}%`,
  }));

  const handlePress = () => {
    bouncePress(scale);
    onToggle(item);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onOpen(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Izquierda: ícono + nombre */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.emojiCircle,
              { backgroundColor: item.color || "#02A394" },
            ]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>

          <View>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.text }]}>
              {count}/{target} completado{target > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Botón de acción */}
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                borderColor: progress >= 1 ? item.color : theme.colors.text,
                backgroundColor: progress >= 1 ? item.color : "transparent",
              },
            ]}
            onPress={handlePress}
          >
            <Text
              style={[
                styles.checkText,
                { color: progress >= 1 ? "#fff" : theme.colors.text },
              ]}
            >
              {progress >= 1 ? "✔" : "+"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Barra de progreso */}
      <View
        style={[
          styles.progressContainer,
          { backgroundColor: theme.colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            progressAnimatedStyle,
            { backgroundColor: item.color },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  emoji: { fontSize: 26 },
  name: { fontSize: 18, fontWeight: "600" },
  subtext: { fontSize: 14, opacity: 0.7 },
  checkButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
});
