import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../styles/globalStyles";

export default function FloatingButton({ onPress, color }) {
  return (
    <TouchableOpacity
      style={[styles.fab]}
      onPress={onPress}
    >
      <Ionicons name="add" size={36} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    backgroundColor: "#02A394"
  },
});
