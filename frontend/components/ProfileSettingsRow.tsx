import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { theme } from "../constants/theme";

type ProfileSettingsRowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  isLast?: boolean;
};

export function ProfileSettingsRow({
  title,
  subtitle,
  onPress,
  leftIcon,
  isLast = false,
}: ProfileSettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center px-4 py-4 active:bg-slate-50 ${isLast ? "" : "border-b border-slate-100"}`}
      onPress={onPress}
    >
      {leftIcon ? (
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <MaterialIcons color={theme.ctaPrimary} name={leftIcon} size={20} />
        </View>
      ) : null}
      <View className="flex-1 pr-3">
        <Text className="font-poppins-medium text-base text-slate-900">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 font-poppins text-xs leading-4 text-slate-400">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <MaterialIcons color={theme.tabInactive} name="chevron-right" size={22} />
    </Pressable>
  );
}
