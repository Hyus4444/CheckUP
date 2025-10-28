import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

export default function ColorSelector({ colors, selected, onSelect, theme }) {
  return (
    <View style={styles.container}>
      {colors.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          style={[
            styles.circle,
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 30,
    margin: 4,
  },
});
