import { ActivityIndicator, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { AlertBanner } from "../../components/AlertBanner";
import { ContentSheet } from "../../components/ContentSheet";
import { GradientHeader } from "../../components/GradientHeader";
import { ProfileEditableField } from "../../components/ProfileFieldsModal";
import { ProfileSettings } from "../../components/ProfileSettings";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { theme } from "../../constants/theme";
import { useProfile } from "../../hooks/useProfile";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const {
    profile,
    ready,
    saving,
    errors,
    authError,
    save,
    setLanguage,
    clearAuthError,
  } = useProfile();
  const [savedNotice, setSavedNotice] = useState(false);

  const profileErrorMessage = () => {
    if (authError === "phone_already_registered") {
      return t("auth.phoneAlreadyRegistered");
    }
    if (authError === "profile_update_failed") {
      return t("profile.saveFailed");
    }
    return null;
  };

  const handleSaveField = async (key: ProfileEditableField, value: string) => {
    setSavedNotice(false);
    clearAuthError();
    const ok = await save({ [key]: value });
    if (ok) {
      setSavedNotice(true);
    }
    return ok;
  };

  if (!ready) {
    return (
      <ResponsiveShell variant="light">
        <StatusBar style="dark" />
        <View className="flex-1" style={{ backgroundColor: theme.surface }}>
          <GradientHeader
            subtitle={t("profile.headerSubtitle")}
            title={t("profile.title")}
          />
          <ContentSheet className="items-center justify-center">
            <ActivityIndicator color={theme.tabActive} size="large" />
          </ContentSheet>
        </View>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell variant="light">
      <StatusBar style="dark" />
      <View className="flex-1" style={{ backgroundColor: theme.surface }}>
        <GradientHeader
          subtitle={t("profile.headerSubtitle")}
          title={t("profile.title")}
        />
        <ContentSheet>
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {savedNotice ? (
              <AlertBanner message={t("profile.fieldUpdated")} variant="success" />
            ) : null}
            {profileErrorMessage() ? (
              <AlertBanner message={profileErrorMessage()!} variant="error" />
            ) : null}
            <ProfileSettings
              errors={errors}
              profile={profile}
              saving={saving}
              onLanguageChange={setLanguage}
              onSaveField={handleSaveField}
            />
          </ScrollView>
        </ContentSheet>
      </View>
    </ResponsiveShell>
  );
}
