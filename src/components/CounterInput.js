import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CounterInput({ value, onIncrement, onDecrement, theme }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onDecrement}>
        <Text style={[styles.symbol, { color: theme.colors.primary }]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text style={[styles.symbol, { color: theme.colors.primary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  symbol: {
    fontSize: 36,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
