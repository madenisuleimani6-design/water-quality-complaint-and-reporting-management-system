import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../constants/theme";

type GradientHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  /** @deprecated Kept for API compatibility; spacing is unified. */
  compact?: boolean;
};

type HeaderBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function HeaderBackButton({
  onPress,
  accessibilityLabel = "Back",
}: HeaderBackButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-10 w-10 items-center justify-center rounded-full"
      hitSlop={8}
      onPress={onPress}
      style={{ backgroundColor: theme.feedback.info.bg }}
    >
      <MaterialIcons color={theme.ctaDark} name="arrow-back" size={22} />
    </Pressable>
  );
}

export function GradientHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const hasSideActions = Boolean(leftAction || rightAction);
  const contentPadding = subtitle ? "px-5 pb-7 pt-5" : "px-5 pb-5 pt-5";

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <View className={contentPadding}>
        {hasSideActions ? (
          <View className="flex-row items-center gap-3">
            {leftAction ?? <View className="w-10" />}
            <View className="min-h-10 flex-1 justify-center">
              <Text
                className="font-poppins-bold text-xl leading-7 text-slate-900"
                numberOfLines={2}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  className="mt-0.5 font-poppins text-sm leading-5 text-slate-500"
                  numberOfLines={2}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {rightAction ?? <View className="w-10" />}
          </View>
        ) : (
          <View>
            <Text className="font-poppins-bold text-2xl leading-8 text-slate-900">
              {title}
            </Text>
            {subtitle ? (
              <Text
                className="mt-1 font-poppins text-sm leading-5 text-slate-500"
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
