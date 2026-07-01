import { ReactNode } from "react";
import { View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

type ChatKeyboardLayoutProps = {
  children: ReactNode;
  composer: ReactNode;
};

/**
 * Chat shell: message list + composer that sticks above the keyboard.
 * Tab screens already lay out above the bottom tab bar — no extra bottom padding.
 */
export function ChatKeyboardLayout({ children, composer }: ChatKeyboardLayoutProps) {
  return (
    <View className="flex-1">
      <View className="flex-1">{children}</View>
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        {composer}
      </KeyboardStickyView>
    </View>
  );
}
