import { TextInput } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";

type NoteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function NoteInput({ value, onChangeText }: NoteInputProps) {
  const { t } = useTranslation();

  return (
    <TextInput
      accessibilityLabel={t("confirm.notePlaceholder")}
      className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-poppins text-base text-slate-900"
      placeholderTextColor={theme.placeholder}
      textAlignVertical="top"
      multiline
      placeholder={t("confirm.notePlaceholder")}
      value={value}
      onChangeText={onChangeText}
    />
  );
}
