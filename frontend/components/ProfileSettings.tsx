import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppLanguage } from "../constants/config";
import { theme } from "../constants/theme";
import { useProfile } from "../hooks/useProfile";
import { CitizenProfile } from "../types/citizen";
import { Card } from "./Card";
import { LanguagePickerModal } from "./LanguagePickerModal";
import {
  ProfileEditableField,
  ProfileFieldsModal,
} from "./ProfileFieldsModal";
import { PrimaryPillButton } from "./PrimaryPillButton";
import { ProfileSettingsRow } from "./ProfileSettingsRow";
const BASIC_FIELDS = [
  {
    key: "fullName" as const,
    labelKey: "profile.fullName",
    placeholderKey: "profile.fullNamePlaceholder",
  },
  {
    key: "phone" as const,
    labelKey: "profile.phone",
    placeholderKey: "profile.phonePlaceholder",
    keyboardType: "phone-pad" as const,
  },
  {
    key: "secondaryPhone" as const,
    labelKey: "profile.secondaryPhone",
    placeholderKey: "profile.phonePlaceholder",
    keyboardType: "phone-pad" as const,
  },
  {
    key: "email" as const,
    labelKey: "profile.email",
    placeholderKey: "profile.emailPlaceholder",
    keyboardType: "email-address" as const,
  },
];

const LOCATION_FIELDS = [
  {
    key: "area" as const,
    labelKey: "profile.area",
    placeholderKey: "profile.areaPlaceholder",
  },
];

type ProfileSheet = "basic" | "location" | "language" | null;

type ProfileSettingsProps = {
  profile: CitizenProfile;
  errors: Record<string, string>;
  saving: boolean;
  onSaveField: (
    key: ProfileEditableField,
    value: string,
  ) => Promise<boolean>;
  onLanguageChange: (language: AppLanguage) => void;
};

export function ProfileSettings({
  profile,
  errors,
  saving,
  onSaveField,
  onLanguageChange,
}: ProfileSettingsProps) {
  const { t } = useTranslation();
  const { logout } = useProfile();
  const [openSheet, setOpenSheet] = useState<ProfileSheet>(null);

  const fieldsModal = useMemo(() => {
    if (openSheet === "basic") {
      return {
        fields: BASIC_FIELDS,
        title: t("profile.basicInformation"),
        subtitle: t("profile.basicInformationHint"),
        snapPoints: ["50%", "85%"] as const,
      };
    }
    if (openSheet === "location") {
      return {
        fields: LOCATION_FIELDS,
        title: t("profile.locationSection"),
        subtitle: t("profile.locationSectionHint"),
        snapPoints: ["42%", "70%"] as const,
      };
    }
    return null;
  }, [openSheet, t]);

  const handleLogoutPress = () => {
    Alert.alert(t("auth.logoutConfirmTitle"), undefined, [
      {
        text: t("auth.logoutConfirmNo"),
        style: "cancel",
      },
      {
        text: t("auth.logoutConfirmYes"),
        style: "destructive",
        onPress: () => {
          void logout().then(() => router.replace("/(auth)/welcome"));
        },
      },
    ]);
  };

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <View>
      <Card className="mb-6 items-center p-6">
        <View
          className="mb-3 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <Text className="font-poppins-bold text-2xl" style={{ color: theme.ctaPrimary }}>
            {initials}
          </Text>
        </View>
        <Text className="font-poppins-bold text-xl text-slate-900">
          {profile.fullName || t("profile.guestUser")}
        </Text>
        <Text className="mt-1 font-poppins text-sm text-slate-500">
          {profile.phone || t("profile.notSet")}
        </Text>
      </Card>

      <Card className="mb-4 overflow-hidden p-0">
        <ProfileSettingsRow
          leftIcon="person-outline"
          subtitle={t("profile.basicInformationRowHint")}
          title={t("profile.basicInformation")}
          onPress={() => setOpenSheet("basic")}
        />
        <ProfileSettingsRow
          leftIcon="place"
          subtitle={t("profile.locationSectionRowHint")}
          title={t("profile.locationSection")}
          onPress={() => setOpenSheet("location")}
        />
        <ProfileSettingsRow
          isLast
          leftIcon="language"
          subtitle={t("profile.languageRowHint")}
          title={t("profile.language")}
          onPress={() => setOpenSheet("language")}
        />
      </Card>

      <View className="mb-4">
        <PrimaryPillButton
          fullWidth
          label={t("auth.signOut")}
          variant="danger"
          onPress={handleLogoutPress}
        />
        <Text className="mt-2 text-center font-poppins text-xs text-slate-500">
          {t("auth.signOutHint")}
        </Text>
      </View>

      <View className="flex-row items-start gap-2 px-1">
        <MaterialIcons color={theme.tabInactive} name="info-outline" size={18} />
        <Text className="flex-1 font-poppins text-xs leading-5 text-slate-500">
          {t("profile.settingsFootnote")}
        </Text>
      </View>

      {fieldsModal ? (
        <ProfileFieldsModal
          key={openSheet}
          errors={errors}
          fields={fieldsModal.fields}
          profile={profile}
          saving={saving}
          sheetName={`profile-fields-${openSheet}`}
          snapPoints={[...fieldsModal.snapPoints]}
          subtitle={fieldsModal.subtitle}
          title={fieldsModal.title}
          visible={openSheet === "basic" || openSheet === "location"}
          onClose={() => setOpenSheet(null)}
          onSaveField={onSaveField}
        />
      ) : null}

      <LanguagePickerModal
        selected={profile.preferredLanguage}
        visible={openSheet === "language"}
        onClose={() => setOpenSheet(null)}
        onSelect={onLanguageChange}
      />
    </View>
  );
}
