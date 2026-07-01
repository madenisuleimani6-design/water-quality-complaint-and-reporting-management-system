import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { NameInput } from "./auth/NameInput";
import { AppLanguage } from "../constants/config";
import { theme } from "../constants/theme";

type OnboardingFormProps = {
  fullName: string;
  language: AppLanguage;
  onChangeFullName: (value: string) => void;
  onChangeLanguage: (language: AppLanguage) => void;
  nameError?: string;
};

const LANGUAGES: AppLanguage[] = ["en", "sw"];

export function OnboardingForm({
  fullName,
  language,
  onChangeFullName,
  onChangeLanguage,
  nameError,
}: OnboardingFormProps) {
  const { t } = useTranslation();

  return (
    <View>
      <NameInput
        error={nameError}
        hint={nameError ? undefined : t("auth.onboardingNameHint")}
        label={t("profile.fullName")}
        placeholder={t("profile.fullNamePlaceholder")}
        value={fullName}
        onChange={onChangeFullName}
      />

      <Text className="mb-2 font-poppins-medium text-sm text-slate-700">
        {t("profile.language")}
      </Text>
      <View className="gap-2">
        {LANGUAGES.map((lang) => {
          const selected = language === lang;
          return (
            <Pressable
              key={lang}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="flex-row items-center rounded-2xl border px-4 py-3.5"
              style={{
                backgroundColor: selected ? theme.feedback.info.bg : theme.card,
                borderColor: selected ? theme.ctaPrimary : theme.border,
              }}
              onPress={() => onChangeLanguage(lang)}
            >
              <View className="flex-1">
                <Text
                  className="font-poppins-semibold text-base"
                  style={{ color: selected ? theme.ctaPrimary : theme.ctaDark }}
                >
                  {t(`language.${lang}`)}
                </Text>
                <Text className="mt-0.5 font-poppins text-sm text-slate-500">
                  {t(`profile.languageName.${lang}`)}
                </Text>
              </View>
              {selected ? (
                <MaterialIcons color={theme.ctaPrimary} name="check-circle" size={22} />
              ) : (
                <View className="h-5 w-5 rounded-full border-2 border-slate-300" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
