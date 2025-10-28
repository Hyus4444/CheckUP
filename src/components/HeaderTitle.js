import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HeaderTitle({ title, subtitle, theme }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 16, opacity: 0.7 },
});
