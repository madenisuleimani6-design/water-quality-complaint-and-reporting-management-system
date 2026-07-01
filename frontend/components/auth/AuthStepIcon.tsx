import { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { theme } from "../../constants/theme";

type AuthStepIconProps = {
  name: ComponentProps<typeof MaterialIcons>["name"];
  color?: string;
  backgroundColor?: string;
};

export function AuthStepIcon({
  name,
  color = theme.ctaPrimary,
  backgroundColor = theme.feedback.info.bg,
}: AuthStepIconProps) {
  return (
    <Animated.View
      className="h-16 w-16 items-center justify-center rounded-2xl"
      entering={FadeInDown.duration(320)}
      style={{ backgroundColor, ...theme.shadow.cardSubtle }}
    >
      <MaterialIcons color={color} name={name} size={32} />
    </Animated.View>
  );
}
