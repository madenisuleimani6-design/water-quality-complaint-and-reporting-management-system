import { Platform } from "react-native";
import { PlatformPressable } from "expo-router/build/react-navigation/elements";
import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs";

/** Tab bar button without press opacity, ripple, or scale feedback. */
export function TabBarButton(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      android_ripple={
        Platform.OS === "android" ? { color: "transparent" } : undefined
      }
      pressOpacity={1}
    />
  );
}
