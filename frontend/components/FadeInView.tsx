import { ReactNode } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

type FadeInViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeInView({
  children,
  className = "",
  delay = 0,
}: FadeInViewProps) {
  return (
    <Animated.View
      className={className}
      entering={FadeInDown.duration(280).delay(delay)}
    >
      {children}
    </Animated.View>
  );
}
