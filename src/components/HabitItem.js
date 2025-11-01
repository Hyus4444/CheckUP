import React from "react";
import { View, Text, TouchableOpacity} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { bouncePress } from "../utils/animations";
import { globalStyles } from "../styles/globalStyles";

export default function HabitItem({
  item,
  theme,
  progress = 0,
  count = 0,
  target = 1,
  onToggle,
  onOpen,
}) {
  const scale = useSharedValue(1);

  // Animación del rebote
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Animación de progreso
  const progressWidth = useSharedValue(progress);

  React.useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 400 });
  }, [progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressWidth.value * 100, 100)}%`,
  }));

  const handlePress = () => {
    bouncePress(scale);
    onToggle(item);
  };

  return (
    <TouchableOpacity
      style={[globalStyles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onOpen(item)}
      activeOpacity={0.8}
    >
      <View style={globalStyles.cardContent}>
        {/* Izquierda: ícono + nombre */}
        <View style={globalStyles.leftSection}>
          <View
            style={[
              globalStyles.emojiCircleCard,
              { backgroundColor: item.color || "#02A394" },
            ]}
          >
            <Text style={globalStyles.emojiHabitCard}>{item.emoji}</Text>
          </View>

          <View>
            <Text style={[globalStyles.name, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[globalStyles.subtext, { color: theme.colors.text }]}>
              {count}/{target} completado{target > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Botón de acción */}
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              globalStyles.checkButton,
              {
                borderColor: progress >= 1 ? item.color : theme.colors.text,
                backgroundColor: progress >= 1 ? item.color : "transparent",
              },
            ]}
            onPress={handlePress}
          >
            <Text
              style={[
                globalStyles.checkText,
                { color: progress >= 1 ? "#fff" : theme.colors.text },
              ]}
            >
              {progress >= 1 ? "✔" : "+"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Barra de progreso */}
      <View
        style={[
          globalStyles.progressContainer,
          { backgroundColor: theme.colors.border },
        ]}
      >
        <Animated.View
          style={[
            globalStyles.progressBarCard,
            progressAnimatedStyle,
            { backgroundColor: item.color },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

