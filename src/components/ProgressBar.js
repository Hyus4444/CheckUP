import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ progress = 0.5, color = "#02A394" }) {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
  },
});
