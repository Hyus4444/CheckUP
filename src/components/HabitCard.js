import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function HabitCard({ item, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={[
        styles.habitCard,
        { backgroundColor: item.color || theme.colors.surface },
      ]}
    >
      <Text style={styles.emoji}>{item.emoji || "✨"}</Text>
      <Text
        style={[
          styles.habitText,
          {
            color: theme.mode === "dark" ? theme.colors.text : "#fff",
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  emoji: {
    fontSize: 28,
    marginRight: 10,
  },
  habitText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
