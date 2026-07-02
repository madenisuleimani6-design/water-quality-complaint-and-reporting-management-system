import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AuthPhoneHero } from "@/components/auth/AuthPhoneHero";
import { PhoneNumberInput } from "@/components/auth/PhoneNumberInput";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { AuthScreen } from "@/components/layout/AuthScreen";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { theme } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";
import { isValidTzPhone, normalizeTzPhone } from "@/utils/phoneValidation";

export function PhonePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendOtp, saving, errors, authError, clearAuthError } = useProfile();
  const [phone, setPhone] = useState("");

  const normalizedPhone = useMemo(
    () => (phone.trim() ? normalizeTzPhone(phone.replace(/\s/g, "")) : ""),
    [phone],
  );
  const isPhoneReady = isValidTzPhone(normalizedPhone);

  const fieldError = () => {
    if (errors.phone === "required") return t("common.required");
    if (errors.phone === "invalid") return t("auth.invalidPhone");
    return undefined;
  };

  const authErrorMessage = () => {
    if (authError === "otp_cooldown") return t("auth.otpCooldown");
    if (authError === "otp_send_failed") return t("auth.otpSendFailed");
    return null;
  };

  const handleContinue = async () => {
    clearAuthError();
    const ok = await sendOtp(phone);
    if (ok) navigate("/otp");
  };

  return (
    <AuthScreen
      centerHeader
      footer={
        <PrimaryPillButton
          disabled={saving || !isPhoneReady}
          fullWidth
          label={t("auth.sendCode")}
          loading={saving}
          onPress={() => void handleContinue()}
        />
      }
      hero={<AuthPhoneHero />}
      showBack
      onBack={() => navigate("/welcome")}
      subtitle={t("auth.phoneSubtitle")}
      title={t("auth.phoneTitle")}
    >
      {authErrorMessage() ? (
        <AlertBanner message={authErrorMessage()!} variant="error" />
      ) : null}

      <PhoneNumberInput
        disabled={saving}
        error={fieldError()}
        hint={fieldError() ? undefined : t("auth.phoneHint")}
        placeholder={t("profile.phonePlaceholder")}
        value={phone}
        onChange={setPhone}
      />

      <div
        className="mt-2 flex items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: theme.card, boxShadow: theme.shadow.cardSubtle }}
      >
        <div
          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.success.bg }}
        >
          <Lock className="h-4 w-4" style={{ color: theme.status.resolved }} />
        </div>
        <p className="flex-1 font-poppins text-sm leading-5 text-slate-500">
          {t("auth.phonePrivacy")}
        </p>
      </div>
    </AuthScreen>
  );
}
