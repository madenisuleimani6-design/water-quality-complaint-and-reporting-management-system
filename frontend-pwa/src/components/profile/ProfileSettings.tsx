import { CheckCircle, Globe, Info, LogOut, MapPin, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/layout/Card";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { AppLanguage } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";
import type { CitizenProfile } from "@/types/citizen";
import { ProfileSettingsRow } from "./ProfileSettingsRow";

type ProfileEditableField = keyof Pick<
  CitizenProfile,
  "fullName" | "phone" | "secondaryPhone" | "email" | "area"
>;

type ProfileSheet = "basic" | "location" | "language" | null;

type ProfileSettingsProps = {
  profile: CitizenProfile;
  errors: Record<string, string>;
  saving: boolean;
  onSaveField: (key: ProfileEditableField, value: string) => Promise<boolean>;
  onLanguageChange: (language: AppLanguage) => void;
};

const BASIC_FIELDS: {
  key: ProfileEditableField;
  labelKey: string;
  placeholderKey: string;
  type?: string;
}[] = [
  { key: "fullName", labelKey: "profile.fullName", placeholderKey: "profile.fullNamePlaceholder" },
  { key: "phone", labelKey: "profile.phone", placeholderKey: "profile.phonePlaceholder", type: "tel" },
  { key: "secondaryPhone", labelKey: "profile.secondaryPhone", placeholderKey: "profile.phonePlaceholder", type: "tel" },
  { key: "email", labelKey: "profile.email", placeholderKey: "profile.emailPlaceholder", type: "email" },
];

const LOCATION_FIELDS = [
  { key: "area" as const, labelKey: "profile.area", placeholderKey: "profile.areaPlaceholder" },
];

const LANGUAGES: AppLanguage[] = ["en", "sw"];

export function ProfileSettings({
  profile,
  errors,
  saving,
  onSaveField,
  onLanguageChange,
}: ProfileSettingsProps) {
  const { t } = useTranslation();
  const { logout } = useProfile();
  const navigate = useNavigate();
  const [openSheet, setOpenSheet] = useState<ProfileSheet>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openFieldSheet = (sheet: ProfileSheet) => {
    if (sheet === "basic") {
      setDraftValues({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        secondaryPhone: profile.secondaryPhone ?? "",
        email: profile.email ?? "",
      });
    } else if (sheet === "location") {
      setDraftValues({ area: profile.area ?? "" });
    }
    setOpenSheet(sheet);
  };

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/welcome");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const fields =
    openSheet === "basic"
      ? BASIC_FIELDS
      : openSheet === "location"
        ? LOCATION_FIELDS
        : [];

  const saveAllFields = async () => {
    for (const field of fields) {
      const ok = await onSaveField(field.key, draftValues[field.key] ?? "");
      if (!ok) return;
    }
    setOpenSheet(null);
  };

  return (
    <div>
      <Card className="mb-6 flex flex-col items-center p-6">
        <div
          className="mb-3 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <span className="font-poppins-bold text-2xl" style={{ color: theme.ctaPrimary }}>
            {initials}
          </span>
        </div>
        <p className="font-poppins-bold text-xl text-slate-900">
          {profile.fullName || t("profile.guestUser")}
        </p>
        <p className="mt-1 font-poppins text-sm text-slate-500">
          {profile.phone || t("profile.notSet")}
        </p>
      </Card>

      <Card className="mb-4 overflow-hidden p-0">
        <ProfileSettingsRow
          leftIcon={User}
          subtitle={t("profile.basicInformationRowHint")}
          title={t("profile.basicInformation")}
          onPress={() => openFieldSheet("basic")}
        />
        <ProfileSettingsRow
          leftIcon={MapPin}
          subtitle={t("profile.locationSectionRowHint")}
          title={t("profile.locationSection")}
          onPress={() => openFieldSheet("location")}
        />
        <ProfileSettingsRow
          isLast
          leftIcon={Globe}
          subtitle={t("profile.languageRowHint")}
          title={t("profile.language")}
          onPress={() => setOpenSheet("language")}
        />
      </Card>

      <div className="mb-4">
        <PrimaryPillButton
          fullWidth
          label={t("auth.signOut")}
          variant="danger"
          onPress={handleLogout}
        />
        <p className="mt-2 text-center font-poppins text-xs text-slate-500">
          {t("auth.signOutHint")}
        </p>
      </div>

      <div className="flex items-start gap-2 px-1">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: theme.tabInactive }} />
        <p className="flex-1 font-poppins text-xs leading-5 text-slate-500">
          {t("profile.settingsFootnote")}
        </p>
      </div>

      <Sheet
        open={openSheet === "basic" || openSheet === "location"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title={
          openSheet === "basic"
            ? t("profile.basicInformation")
            : t("profile.locationSection")
        }
        description={
          openSheet === "basic"
            ? t("profile.basicInformationHint")
            : t("profile.locationSectionHint")
        }
      >
        <div className="flex flex-col gap-4 pb-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-2 block font-poppins-medium text-sm text-slate-700">
                {t(field.labelKey)}
              </label>
              <Input
                type={"type" in field ? field.type : undefined}
                value={draftValues[field.key] ?? ""}
                placeholder={t(field.placeholderKey)}
                onChange={(e) =>
                  setDraftValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
              {errors[field.key] ? (
                <p className="mt-1 font-poppins text-xs text-red-600">
                  {t("profile.invalidField")}
                </p>
              ) : null}
            </div>
          ))}
          <PrimaryPillButton
            label={t("profile.applyChanges")}
            loading={saving}
            onPress={() => void saveAllFields()}
          />
        </div>
      </Sheet>

      <Sheet
        open={openSheet === "language"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title={t("profile.chooseLanguage")}
        description={t("profile.chooseLanguageHint")}
      >
        <div className="flex flex-col gap-2 pb-6">
          {LANGUAGES.map((lang) => {
            const selected = profile.preferredLanguage === lang;
            return (
              <button
                key={lang}
                type="button"
                className="flex items-center rounded-2xl border px-4 py-3.5 text-left"
                style={{
                  backgroundColor: selected ? theme.feedback.info.bg : theme.card,
                  borderColor: selected ? theme.ctaPrimary : theme.border,
                }}
                onClick={() => {
                  onLanguageChange(lang);
                  setOpenSheet(null);
                }}
              >
                <div className="flex-1">
                  <p
                    className="font-poppins-semibold text-base"
                    style={{ color: selected ? theme.ctaPrimary : theme.ctaDark }}
                  >
                    {t(`language.${lang}`)}
                  </p>
                  <p className="mt-0.5 font-poppins text-sm text-slate-500">
                    {t(`profile.languageName.${lang}`)}
                  </p>
                </div>
                {selected ? (
                  <CheckCircle className="h-[22px] w-[22px]" style={{ color: theme.ctaPrimary }} />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      <ConfirmDialog
        cancelLabel={t("auth.logoutConfirmNo")}
        confirmLabel={t("auth.logoutConfirmYes")}
        confirmVariant="danger"
        description={t("auth.signOutHint")}
        icon={LogOut}
        loading={loggingOut}
        open={logoutOpen}
        title={t("auth.logoutConfirmTitle")}
        onConfirm={confirmLogout}
        onOpenChange={setLogoutOpen}
      />
    </div>
  );
}
