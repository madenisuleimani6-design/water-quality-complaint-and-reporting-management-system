import { Text, View } from "react-native";

import { theme } from "../constants/theme";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  onPrimary?: boolean;
  variant?: "centered" | "inline";
};

export function SectionTitle({
  title,
  subtitle,
  onPrimary = false,
  variant = "centered",
}: SectionTitleProps) {
  const isInline = variant === "inline";

  return (
    <View
      className={`mb-4 ${isInline ? "items-start" : "mb-6 items-center px-4"}`}
    >
      <Text
        className={`font-poppins-bold ${isInline ? "text-base text-slate-900" : "text-center text-xl"}`}
        style={
          !isInline
            ? { color: onPrimary ? theme.textOnPrimary : theme.ctaDark }
            : undefined
        }
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          className={`mt-1 font-poppins text-sm leading-5 ${isInline ? "text-slate-500" : "text-center"}`}
          style={
            !isInline
              ? {
                  color: onPrimary
                    ? theme.textMutedOnPrimary
                    : theme.textMuted,
                }
              : undefined
          }
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
