import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

import { gradientColors, theme } from "../../constants/theme";
import { AuthHeroCanvas } from "./AuthHeroCanvas";

function FloatingBubble({
  size,
  top,
  left,
  right,
  delay,
  opacity = 0.35,
}: {
  size: number;
  top: number;
  left?: number;
  right?: number;
  delay: number;
  opacity?: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2200 }),
        withTiming(0, { duration: 2200 }),
      ),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(600).delay(delay)}
      style={[
        animatedStyle,
        {
          position: "absolute",
          top,
          ...(left != null ? { left } : {}),
          ...(right != null ? { right } : {}),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.ctaPrimary,
          opacity,
        },
      ]}
    />
  );
}

export function AuthHeroGraphic() {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <AuthHeroCanvas height={208}>
        <FloatingBubble delay={200} left={20} size={14} top={28} />
        <FloatingBubble delay={400} right={28} opacity={0.25} size={20} top={16} />
        <FloatingBubble delay={600} right={18} opacity={0.2} size={10} top={120} />
        <FloatingBubble delay={300} left={44} opacity={0.22} size={12} top={140} />

        <View className="absolute inset-0 items-center justify-center">
          <LinearGradient
            colors={[...gradientColors]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{
              width: 148,
              height: 148,
              borderRadius: 74,
              alignItems: "center",
              justifyContent: "center",
              ...theme.shadow.fab,
            }}
          >
            <MaterialIcons color={theme.textOnPrimary} name="water-drop" size={72} />
          </LinearGradient>
        </View>

        <Animated.View
          className="absolute h-11 w-11 items-center justify-center rounded-2xl"
          entering={FadeIn.duration(500).delay(250)}
          style={{
            top: 24,
            right: 20,
            backgroundColor: theme.card,
            ...theme.shadow.card,
          }}
        >
          <MaterialIcons color={theme.status.resolved} name="verified" size={22} />
        </Animated.View>

        <Animated.View
          className="absolute h-11 w-11 items-center justify-center rounded-2xl"
          entering={FadeIn.duration(500).delay(350)}
          style={{
            bottom: 16,
            left: 36,
            backgroundColor: theme.card,
            ...theme.shadow.card,
          }}
        >
          <MaterialIcons color={theme.ctaPrimary} name="location-on" size={22} />
        </Animated.View>

        <Animated.View
          className="absolute h-11 w-11 items-center justify-center rounded-2xl"
          entering={FadeIn.duration(500).delay(450)}
          style={{
            bottom: 40,
            right: 52,
            backgroundColor: theme.card,
            ...theme.shadow.card,
          }}
        >
          <MaterialIcons color={theme.status.investigating} name="forum" size={22} />
        </Animated.View>
      </AuthHeroCanvas>
    </Animated.View>
  );
}
