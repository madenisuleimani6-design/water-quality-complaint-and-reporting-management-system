import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { gradientColors, theme } from "../../constants/theme";
import { AuthHeroCanvas } from "./AuthHeroCanvas";

export function AuthOnboardingHero() {
  return (
    <Animated.View entering={FadeInDown.duration(350)}>
      <AuthHeroCanvas height={148}>
        <View className="absolute inset-0 items-center justify-center">
          <LinearGradient
            colors={[...gradientColors]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              alignItems: "center",
              justifyContent: "center",
              ...theme.shadow.card,
            }}
          >
            <MaterialIcons color={theme.textOnPrimary} name="badge" size={40} />
          </LinearGradient>
        </View>

        <Animated.View
          className="absolute h-10 w-10 items-center justify-center rounded-2xl"
          entering={FadeIn.duration(400).delay(120)}
          style={{
            top: 16,
            left: 28,
            backgroundColor: theme.card,
            ...theme.shadow.cardSubtle,
          }}
        >
          <MaterialIcons color={theme.ctaPrimary} name="translate" size={20} />
        </Animated.View>

        <Animated.View
          className="absolute h-10 w-10 items-center justify-center rounded-2xl"
          entering={FadeIn.duration(400).delay(200)}
          style={{
            top: 8,
            right: 28,
            backgroundColor: theme.card,
            ...theme.shadow.cardSubtle,
          }}
        >
          <MaterialIcons color={theme.status.resolved} name="check-circle" size={20} />
        </Animated.View>

        <Animated.View
          className="absolute h-9 w-9 items-center justify-center rounded-xl"
          entering={FadeIn.duration(400).delay(280)}
          style={{
            bottom: 8,
            right: 52,
            backgroundColor: theme.feedback.info.bg,
          }}
        >
          <MaterialIcons color={theme.ctaPrimary} name="edit" size={18} />
        </Animated.View>

        <Animated.View
          className="absolute h-9 w-9 items-center justify-center rounded-xl"
          entering={FadeIn.duration(400).delay(340)}
          style={{
            bottom: 16,
            left: 52,
            backgroundColor: theme.feedback.success.bg,
          }}
        >
          <MaterialIcons color={theme.status.resolved} name="verified" size={18} />
        </Animated.View>
      </AuthHeroCanvas>
    </Animated.View>
  );
}
