import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { TAB_BAR_CONTENT_HEIGHT } from "../constants/layout";
import { theme } from "../constants/theme";
import { useBottomSafeInset } from "../hooks/useBottomSafeInset";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FloatingActionButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function FloatingActionButton({
  onPress,
  accessibilityLabel,
  icon = "add",
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);
  const bottomInset = useBottomSafeInset();
  const bottom = TAB_BAR_CONTENT_HEIGHT + bottomInset + 16;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute right-4 h-14 w-14 items-center justify-center rounded-full"
      style={[
        theme.shadow.fab,
        { backgroundColor: theme.ctaPrimary, bottom },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 12, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 280 });
      }}
    >
      <MaterialIcons color={theme.textOnPrimary} name={icon} size={28} />
    </AnimatedPressable>
  );
}
