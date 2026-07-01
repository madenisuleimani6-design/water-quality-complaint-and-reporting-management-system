import { ReactNode } from "react";
import { Pressable, View, ViewStyle } from "react-native";

import { theme } from "../constants/theme";

type CardProps = {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  subtle?: boolean;
};

export function Card({
  children,
  className = "",
  accentColor,
  onPress,
  style,
  subtle = false,
}: CardProps) {
  const shadowStyle = subtle ? theme.shadow.cardSubtle : theme.shadow.card;

  const inner = (
    <View
      className={`overflow-hidden rounded-2xl bg-white ${className}`}
      style={[shadowStyle, style]}
    >
      {accentColor ? (
        <View className="flex-row">
          <View style={{ width: 4, backgroundColor: accentColor }} />
          <View className="flex-1">{children}</View>
        </View>
      ) : (
        children
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}
