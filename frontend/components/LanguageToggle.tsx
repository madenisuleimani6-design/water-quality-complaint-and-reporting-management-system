import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppLanguage } from "../constants/config";

type LanguageToggleProps = {
  currentLanguage: AppLanguage;
  onToggle: () => void;
};

export function LanguageToggle({
  currentLanguage,
  onToggle,
}: LanguageToggleProps) {
  const { t } = useTranslation();
  const label =
    currentLanguage === "en" ? t("language.sw") : t("language.en");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Switch language to ${label}`}
      className="absolute right-4 top-12 z-10 rounded-full bg-black/50 px-3 py-2"
      onPress={onToggle}
    >
      <Text className="text-sm font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
