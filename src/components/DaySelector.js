import React from "react";
import { View, TouchableOpacity, Text} from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function DaySelector({ days, selectedDays, onToggle, theme }) {
  return (
    <View style={globalStyles.daysRow
    }>
      {days.map((day, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onToggle(index)}
          style={[
            globalStyles.dayCircle,
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
