import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";

import { useKeyboardOffset } from "../hooks/useKeyboardOffset";
import { isWeb } from "../utils/platform";

type KeyboardSafeScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  className?: string;
};

export function KeyboardSafeScreen({
  children,
  contentContainerStyle,
  className = "",
}: KeyboardSafeScreenProps) {
  const keyboardOffset = useKeyboardOffset();

  if (isWeb) {
    return (
      <ScrollView
        className={`flex-1 ${className}`}
        contentContainerStyle={[
          { flexGrow: 1, paddingBottom: keyboardOffset + 16 },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={`flex-1 ${className}`}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
