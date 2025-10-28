import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ProgressBar from "./ProgressBar";

export default function HabitStatsCard({ name, emoji, progress, theme }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
      </View>
      <ProgressBar progress={progress} color={theme.colors.secondary} />
      <Text style={[styles.percent, { color: theme.colors.text }]}>
        {(progress * 100).toFixed(0)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  percent: {
    textAlign: "right",
    marginTop: 5,
    fontSize: 14,
  },
});
