import { withTiming, withSpring } from "react-native-reanimated";

/**
 * Aplica un pequeño rebote al presionar (zoom in/out)
 */
export const bouncePress = (scale) => {
  scale.value = withSpring(1.15, { damping: 4, stiffness: 120 });
  setTimeout(() => (scale.value = withTiming(1, { duration: 150 })), 120);
};

/**
 * Transición de aparición suave
 */
export const fadeIn = (opacity) => {
  opacity.value = withTiming(1, { duration: 300 });
};

/**
 * Transición de desaparición suave
 */
export const fadeOut = (opacity) => {
  opacity.value = withTiming(0, { duration: 300 });
};

/**
 * Deslizamiento desde abajo (ideal para modales o botones)
 */
export const slideUp = (translateY) => {
  translateY.value = withSpring(0, { damping: 6, stiffness: 120 });
};

/**
 * Rebote general al completar una acción
 */
export const bounceComplete = (scale) => {
  scale.value = withSpring(1.25, { damping: 3, stiffness: 150 });
  setTimeout(() => (scale.value = withTiming(1, { duration: 200 })), 200);
};
