import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { theme } from "../constants/theme";
import { isWeb } from "../utils/platform";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "outline" | "dashed" | "dark" | "light" | "danger";

type PrimaryPillButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  fullWidth?: boolean;
};

function getVariantStyles(variant: ButtonVariant): {
  container: ViewStyle;
  textColor: string;
  spinnerColor: string;
  borderStyle?: ViewStyle;
} {
  switch (variant) {
    case "secondary":
      return {
        container: { backgroundColor: theme.ctaSecondary },
        textColor: theme.ctaPrimary,
        spinnerColor: theme.ctaPrimary,
        borderStyle: { borderWidth: 1.5, borderColor: theme.ctaPrimary },
      };
    case "outline":
      return {
        container: { backgroundColor: "transparent" },
        textColor: theme.textMuted,
        spinnerColor: theme.textMuted,
        borderStyle: { borderWidth: 1.5, borderColor: theme.border },
      };
    case "dashed":
      return {
        container: { backgroundColor: theme.card },
        textColor: theme.textMuted,
        spinnerColor: theme.textMuted,
        borderStyle: {
          borderWidth: 1.5,
          borderColor: theme.border,
          borderStyle: "dashed",
        },
      };
    case "dark":
      return {
        container: { backgroundColor: theme.ctaDark },
        textColor: theme.textOnPrimary,
        spinnerColor: theme.textOnPrimary,
      };
    case "light":
      return {
        container: { backgroundColor: theme.ctaSecondary },
        textColor: theme.ctaDark,
        spinnerColor: theme.ctaDark,
      };
    case "danger":
      return {
        container: { backgroundColor: theme.feedback.error.text },
        textColor: theme.textOnPrimary,
        spinnerColor: theme.textOnPrimary,
      };
    case "primary":
    default:
      return {
        container: { backgroundColor: theme.ctaPrimary },
        textColor: theme.textOnPrimary,
        spinnerColor: theme.textOnPrimary,
      };
  }
}

export function PrimaryPillButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
  fullWidth = false,
}: PrimaryPillButtonProps) {
  const scale = useSharedValue(1);
  const styles = getVariantStyles(variant);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      className={`min-h-[52px] items-center justify-center rounded-full px-6 ${fullWidth ? "w-full self-stretch" : ""} ${disabled || loading ? "opacity-60" : ""} ${className}`}
      disabled={disabled || loading}
      style={[
        styles.container,
        styles.borderStyle,
        fullWidth ? { width: "100%", alignSelf: "stretch" as const } : null,
        isWeb
          ? ({
              cursor: disabled || loading ? "default" : "pointer",
            } as ViewStyle)
          : null,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinnerColor} />
      ) : (
        <Text
          className="text-center font-poppins-semibold text-base"
          style={{ color: styles.textColor }}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
