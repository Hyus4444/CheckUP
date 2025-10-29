// simple ProgressBar que espera progress 0..1
import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ progress = 0, color = "#02A394", height = 10 }) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: "#E6E6E6",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
