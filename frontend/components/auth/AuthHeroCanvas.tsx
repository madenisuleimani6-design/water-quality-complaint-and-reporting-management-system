import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

/** Fixed-width stage so floating auth icons align on web and native. */
export const AUTH_HERO_WIDTH = 300;

type AuthHeroCanvasProps = {
  height: number;
  children: ReactNode;
  style?: ViewStyle;
};

export function AuthHeroCanvas({ height, children, style }: AuthHeroCanvasProps) {
  return (
    <View className="mb-2 w-full items-center">
      <View
        className="relative"
        style={[{ width: AUTH_HERO_WIDTH, height, maxWidth: "100%" }, style]}
      >
        {children}
      </View>
    </View>
  );
}
