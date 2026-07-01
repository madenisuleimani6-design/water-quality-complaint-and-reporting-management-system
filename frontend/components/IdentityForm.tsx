import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormField } from "./FormField";
import { PrimaryPillButton } from "./PrimaryPillButton";

type IdentityFormProps = {
  fullName: string;
  phone: string;
  errors: Record<string, string>;
  saving?: boolean;
  submitLabel: string;
  onChangeFullName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onSubmit: () => void;
};

export function IdentityForm({
  fullName,
  phone,
  errors,
  saving = false,
  submitLabel,
  onChangeFullName,
  onChangePhone,
  onSubmit,
}: IdentityFormProps) {
  const { t } = useTranslation();

  const fieldError = (key: string) => {
    if (!errors[key]) return undefined;
    if (errors[key] === "required") return t("common.required");
    return t("profile.invalidField");
  };

  return (
    <View>
      <FormField
        error={fieldError("fullName")}
        label={t("profile.fullName")}
        placeholder={t("profile.fullNamePlaceholder")}
        value={fullName}
        onChangeText={onChangeFullName}
      />
      <FormField
        error={fieldError("phone")}
        keyboardType="phone-pad"
        label={t("profile.phone")}
        placeholder={t("profile.phonePlaceholder")}
        value={phone}
        onChangeText={onChangePhone}
      />
      <PrimaryPillButton
        label={submitLabel}
        loading={saving}
        onPress={onSubmit}
      />
    </View>
  );
}
