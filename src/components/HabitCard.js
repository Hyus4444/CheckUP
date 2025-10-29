import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function HabitCard({ item, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={[
        globalStyles.habitCard,
        { backgroundColor: item.color || theme.colors.surface },
      ]}
    >
      <Text style={globalStyles.emoji}>{item.emoji}</Text>
      <Text
        style={[
          globalStyles.habitText,
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


