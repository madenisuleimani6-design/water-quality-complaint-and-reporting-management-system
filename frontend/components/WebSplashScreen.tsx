import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, View } from "react-native";

import { gradientColors, theme } from "../constants/theme";

export function WebSplashScreen() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: "#0f172a", minHeight: "100dvh" }}
    >
      <LinearGradient
        colors={[...gradientColors]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          ...theme.shadow.fab,
        }}
      >
        <Image
          accessibilityLabel="DAWASA"
          resizeMode="contain"
          source={require("../assets/splash-icon.png")}
          style={{ width: 72, height: 72 }}
        />
      </LinearGradient>
      <ActivityIndicator color={theme.gradientTop} size="large" />
    </View>
  );
}
