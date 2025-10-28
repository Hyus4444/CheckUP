import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function DaySelector({ days, selectedDays, onToggle, theme }) {
  return (
    <View style={styles.row}>
      {days.map((day, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onToggle(index)}
          style={[
            styles.day,
            {
              backgroundColor: selectedDays.includes(index)
                ? theme.colors.secondary
                : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={{
              color: selectedDays.includes(index)
                ? "#fff"
                : theme.colors.text,
              fontWeight: "bold",
            }}
          >
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
});
