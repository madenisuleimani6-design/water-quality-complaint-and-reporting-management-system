import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "@/components/layout/AlertBanner";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { theme } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";

export function ProfilePage() {
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
    if (authError === "phone_already_registered") return t("auth.phoneAlreadyRegistered");
    if (authError === "profile_update_failed") return t("profile.saveFailed");
    return null;
  };

  const handleSaveField = async (
    key: "fullName" | "phone" | "secondaryPhone" | "email" | "area",
    value: string,
  ) => {
    setSavedNotice(false);
    clearAuthError();
    const ok = await save({ [key]: value });
    if (ok) setSavedNotice(true);
    return ok;
  };

  if (!ready) {
    return (
      <TabScreenLayout
        subtitle={t("profile.headerSubtitle")}
        title={t("profile.title")}
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.tabActive }} />
        </div>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout
      scrollClassName="pb-6"
      subtitle={t("profile.headerSubtitle")}
      title={t("profile.title")}
    >
      <div>
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
      </div>
    </TabScreenLayout>
  );
}
