import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";

import { theme } from "../constants/theme";

type IconCircleButtonProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  dark?: boolean;
};

export function IconCircleButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 22,
  dark = false,
}: IconCircleButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={`h-11 w-11 items-center justify-center rounded-full ${
        dark ? "bg-black/40" : "bg-white"
      }`}
      onPress={onPress}
    >
      <MaterialIcons
        color={dark ? theme.textOnPrimary : theme.ctaPrimary}
        name={icon}
        size={size}
      />
    </Pressable>
  );
}
