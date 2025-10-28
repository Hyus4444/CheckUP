// src/components/HabitItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { bouncePress } from "../utils/animations";

export default function HabitItem({
  item,
  theme,
  isCompleted,
  onToggle,
  onOpen,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
        <View style={styles.leftSection}>
          <View
            style={[
              styles.emojiCircle,
              { backgroundColor: item.color || "#02A394" },
            ]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.name}
          </Text>
        </View>

        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                borderColor: isCompleted ? item.color : theme.colors.text,
                backgroundColor: isCompleted ? item.color : "transparent",
              },
            ]}
            onPress={handlePress}
          >
            <Text
              style={[
                styles.checkText,
                { color: isCompleted ? "#fff" : theme.colors.text },
              ]}
            >
              {isCompleted ? "✔" : "✘"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
  checkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
