import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppLanguage } from "../constants/config";
import { theme } from "../constants/theme";
import { FadeInView } from "./FadeInView";
import { ProfileBottomSheet } from "./ProfileBottomSheet";

type LanguagePickerModalProps = {
  visible: boolean;
  selected: AppLanguage;
  onClose: () => void;
  onSelect: (language: AppLanguage) => void;
};

const LANGUAGES: AppLanguage[] = ["en", "sw"];

export function LanguagePickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: LanguagePickerModalProps) {
  const { t } = useTranslation();

  return (
    <ProfileBottomSheet
      dynamic
      scrollable={false}
      sheetName="profile-language"
      title={t("profile.chooseLanguage")}
      visible={visible}
      onClose={onClose}
    >
      <Text className="mb-4 px-4 font-poppins text-sm text-slate-500">
        {t("profile.chooseLanguageHint")}
      </Text>
      {LANGUAGES.map((lang, index) => {
        const isSelected = selected === lang;
        return (
          <FadeInView key={lang} delay={80 + index * 60}>
            <Pressable
            accessibilityRole="button"
            className="mx-4 mb-2 flex-row items-center rounded-2xl border px-4 py-4"
            style={{
              backgroundColor: isSelected ? theme.feedback.info.bg : theme.card,
              borderColor: isSelected ? theme.ctaPrimary : theme.border,
            }}
            onPress={() => {
              onSelect(lang);
              onClose();
            }}
          >
            <View className="flex-1">
              <Text
                className="font-poppins-semibold text-base"
                style={{ color: isSelected ? theme.ctaPrimary : theme.ctaDark }}
              >
                {t(`language.${lang}`)}
              </Text>
              <Text className="mt-0.5 font-poppins text-sm text-slate-500">
                {t(`profile.languageName.${lang}`)}
              </Text>
            </View>
            {isSelected ? (
              <MaterialIcons color={theme.ctaPrimary} name="check-circle" size={24} />
            ) : (
              <View className="h-6 w-6 rounded-full border-2 border-slate-300" />
            )}
            </Pressable>
          </FadeInView>
        );
      })}
      <View className="h-6" />
    </ProfileBottomSheet>
  );
}
