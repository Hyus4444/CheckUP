import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../styles/globalStyles";

export default function FloatingButton({ onPress }) {
  return (
    <TouchableOpacity
      style={[globalStyles.fab]}
      onPress={onPress}
    >
      <Ionicons name="add" size={36} color="#fff" />
    </TouchableOpacity>
  );
}


