import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function ColorSelector({ colors, selected, onSelect, theme }) {
  return (
    <View style={globalStyles.containerColor}>
      {colors.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          style={[
            globalStyles.circleColor ,
            {
              backgroundColor: c,
              borderColor: c === selected ? theme.colors.text : theme.colors.border,
              borderWidth: c === selected ? 3 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}


