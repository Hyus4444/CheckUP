import React from "react";
import { View, Text} from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function HabitFormField({ label, children, theme }) {
  return (
    <View style={globalStyles.containerFormHabit}>
      <Text style={[globalStyles.label, { color: theme.colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

