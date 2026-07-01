import { Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AuthOnboardingHero } from "@/components/auth/AuthOnboardingHero";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { AuthScreen } from "@/components/layout/AuthScreen";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import type { AppLanguage } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";

export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeOnboarding, profile, saving, errors, authError, clearAuthError } =
    useProfile();
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>(profile.preferredLanguage);

  const nameError = () => {
    if (errors.fullName === "required") return t("common.required");
    return undefined;
  };

  const authErrorMessage = () => {
    if (authError === "phone_already_registered") return t("auth.phoneAlreadyRegistered");
    if (authError === "register_failed") return t("auth.registerFailed");
    return null;
  };

  const handleContinue = async () => {
    clearAuthError();
    const ok = await completeOnboarding({ fullName, preferredLanguage: language });
    if (ok) navigate("/home", { replace: true });
  };

  return (
    <AuthScreen
      footer={
        <PrimaryPillButton
          disabled={saving}
          fullWidth
          label={t("auth.finishSetup")}
          loading={saving}
          onPress={() => void handleContinue()}
        />
      }
      hero={<AuthOnboardingHero />}
    >
      {authErrorMessage() ? (
        <AlertBanner message={authErrorMessage()!} variant="error" />
      ) : null}
      <div className="mt-6">
        <OnboardingForm
          fullName={fullName}
          language={language}
          nameError={nameError()}
          onChangeFullName={setFullName}
          onChangeLanguage={setLanguage}
        />
      </div>

      <div
        className="mt-2 flex items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: theme.card, boxShadow: theme.shadow.cardSubtle }}
      >
        <div
          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <Info className="h-4 w-4" style={{ color: theme.ctaPrimary }} />
        </div>
        <p className="flex-1 font-poppins text-sm leading-5 text-slate-500">
          {t("auth.onboardingPrivacy")}
        </p>
      </div>
    </AuthScreen>
  );
}
