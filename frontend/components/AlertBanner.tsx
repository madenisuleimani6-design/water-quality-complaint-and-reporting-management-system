import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import { theme } from "../constants/theme";

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertBannerProps = {
  variant: AlertVariant;
  message: string;
  children?: ReactNode;
  dashed?: boolean;
};

const icons: Record<AlertVariant, keyof typeof MaterialIcons.glyphMap> = {
  info: "info-outline",
  success: "check-circle-outline",
  warning: "warning-amber",
  error: "error-outline",
};

export function AlertBanner({
  variant,
  message,
  children,
  dashed = false,
}: AlertBannerProps) {
  const colors = theme.feedback[variant];

  return (
    <View
      className={`mb-3 rounded-2xl px-4 py-3 ${dashed ? "border-dashed" : ""}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-start gap-2">
        <MaterialIcons color={colors.text} name={icons[variant]} size={20} />
        <Text
          className="flex-1 font-poppins text-sm leading-5"
          style={{ color: colors.text }}
        >
          {message}
        </Text>
      </View>
      {children}
    </View>
  );
}
