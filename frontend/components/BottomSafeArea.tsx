import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffectiveSafeArea } from "../hooks/useEffectiveSafeArea";
import { isWeb } from "../utils/platform";

type BottomSafeAreaProps = {
  children?: ReactNode;
  className?: string;
  style?: ViewStyle;
};

/** Applies only the bottom safe inset (home indicator / Android nav). */
export function BottomSafeArea({
  children,
  className = "",
  style,
}: BottomSafeAreaProps) {
  const insets = useEffectiveSafeArea();

  if (!isWeb) {
    return (
      <SafeAreaView className={className} edges={["bottom"]} style={style}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View
      className={className}
      style={[style, { paddingBottom: insets.bottom }]}
    >
      {children}
    </View>
  );
}
