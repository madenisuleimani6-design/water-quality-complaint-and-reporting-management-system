import { ReactNode } from "react";
import { View } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { useEffectiveSafeArea } from "../hooks/useEffectiveSafeArea";
import { isWeb } from "../utils/platform";

export type SafeEdge = Edge;

type SafeScreenProps = {
  children: ReactNode;
  /** Which edges get safe-area padding. Default: left + right only (top/bottom handled elsewhere). */
  edges?: SafeEdge[];
  className?: string;
};

export function SafeScreen({
  children,
  edges = ["left", "right"],
  className = "flex-1",
}: SafeScreenProps) {
  const insets = useEffectiveSafeArea();

  if (!isWeb) {
    return (
      <SafeAreaView className={className} edges={edges}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View
      className={className}
      style={{
        paddingTop: edges.includes("top") ? insets.top : 0,
        paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
        paddingLeft: edges.includes("left") ? insets.left : 0,
        paddingRight: edges.includes("right") ? insets.right : 0,
      }}
    >
      {children}
    </View>
  );
}
