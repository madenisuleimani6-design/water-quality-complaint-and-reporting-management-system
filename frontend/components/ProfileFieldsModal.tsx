import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { CitizenProfile } from "../types/citizen";
import { FadeInView } from "./FadeInView";
import { FormField } from "./FormField";
import { ProfileBottomSheet } from "./ProfileBottomSheet";

export type ProfileEditableField =
  | "fullName"
  | "phone"
  | "secondaryPhone"
  | "email"
  | "area";

type ProfileFieldConfig = {
  key: ProfileEditableField;
  labelKey: string;
  placeholderKey: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
};

type ProfileFieldsModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  sheetName: string;
  fields: ProfileFieldConfig[];
  profile: CitizenProfile;
  errors: Record<string, string>;
  saving: boolean;
  snapPoints?: (string | number)[];
  onClose: () => void;
  onSaveField: (
    key: ProfileEditableField,
    value: string,
  ) => Promise<boolean>;
};

export function ProfileFieldsModal({
  visible,
  title,
  subtitle,
  sheetName,
  fields,
  profile,
  errors,
  saving,
  snapPoints,
  onClose,
  onSaveField,
}: ProfileFieldsModalProps) {
  const { t } = useTranslation();
  const [editingKey, setEditingKey] = useState<ProfileEditableField | null>(
    null,
  );
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    if (!visible) {
      setEditingKey(null);
      setDraftValue("");
    }
  }, [visible]);

  const fieldError = (key: string) => {
    if (errors[key] === "required") return t("common.required");
    if (errors[key] === "invalid") return t("profile.invalidField");
    return undefined;
  };

  const getValue = (key: ProfileEditableField) => {
    const raw = profile[key];
    return typeof raw === "string" ? raw : "";
  };

  const startEdit = (key: ProfileEditableField) => {
    setEditingKey(key);
    setDraftValue(getValue(key));
  };

  const handleApply = async () => {
    if (!editingKey) {
      return;
    }
    const ok = await onSaveField(editingKey, draftValue);
    if (ok) {
      setEditingKey(null);
      setDraftValue("");
    }
  };

  const editingConfig = fields.find((f) => f.key === editingKey);

  return (
    <ProfileBottomSheet
      sheetName={sheetName}
      snapPoints={snapPoints}
      subtitle={subtitle}
      title={title}
      visible={visible}
      onClose={onClose}
    >
      {editingKey && editingConfig ? (
        <FadeInView className="px-4 pb-6 pt-2">
          <FormField
            InputComponent={BottomSheetTextInput}
            error={fieldError(editingKey)}
            keyboardType={editingConfig.keyboardType}
            label={t(editingConfig.labelKey as "profile.fullName")}
            placeholder={t(
              editingConfig.placeholderKey as "profile.fullNamePlaceholder",
            )}
            value={draftValue}
            onChangeText={setDraftValue}
          />
          <View className="mt-2 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center rounded-full border border-slate-200 py-3"
              disabled={saving}
              onPress={() => {
                setEditingKey(null);
                setDraftValue("");
              }}
            >
              <Text className="font-poppins-medium text-base text-slate-600">
                {t("common.cancel")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center rounded-full py-3"
              disabled={saving}
              style={{ backgroundColor: theme.ctaPrimary }}
              onPress={() => void handleApply()}
            >
              {saving ? (
                <ActivityIndicator color={theme.textOnPrimary} />
              ) : (
                <>
                  <MaterialIcons
                    color={theme.textOnPrimary}
                    name="check"
                    size={20}
                  />
                  <Text className="ml-2 font-poppins-semibold text-base text-white">
                    {t("profile.applyChanges")}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </FadeInView>
      ) : (
        <View className="px-0">
          {fields.map((field, index) => {
            const value = getValue(field.key);
            const display = value.trim() || t("profile.notSet");
            const isLast = index === fields.length - 1;
            return (
              <FadeInView key={field.key} delay={index * 45}>
                <View
                  className={`flex-row items-center px-4 py-4 ${isLast ? "" : "border-b border-slate-100"}`}
                >
                <View className="flex-1 pr-3">
                  <Text className="font-poppins-medium text-sm text-slate-500">
                    {t(field.labelKey as "profile.fullName")}
                  </Text>
                  <Text
                    className={`mt-1 font-poppins text-base ${value.trim() ? "text-slate-900" : "text-slate-400"}`}
                    numberOfLines={2}
                  >
                    {display}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={t("profile.editField")}
                  accessibilityRole="button"
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.feedback.info.bg }}
                  onPress={() => startEdit(field.key)}
                >
                  <MaterialIcons
                    color={theme.ctaPrimary}
                    name="edit"
                    size={20}
                  />
                </Pressable>
                </View>
              </FadeInView>
            );
          })}
        </View>
      )}
    </ProfileBottomSheet>
  );
}
