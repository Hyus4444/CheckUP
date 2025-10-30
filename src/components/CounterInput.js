import React from "react";
import { View, Text, TouchableOpacity} from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function CounterInput({ value, onIncrement, onDecrement, theme }) {
  return (
    <View style={globalStyles.containerCounterInput}>
      <TouchableOpacity onPress={onDecrement}>
        <Text style={[globalStyles.symbol, { color: theme.colors.primary }]}>−</Text>
      </TouchableOpacity>
      <Text style={[globalStyles.valueContador, { color: theme.colors.text }]}>{value}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text style={[globalStyles.symbol, { color: theme.colors.primary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
