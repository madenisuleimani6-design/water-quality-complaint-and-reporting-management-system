import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { OtpInput } from "@/components/auth/OtpInput";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { AuthScreen } from "@/components/layout/AuthScreen";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { theme } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";

const RESEND_SECONDS = 60;

export function OtpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    verifyOtp,
    sendOtp,
    pendingPhone,
    otpDevCode,
    saving,
    authError,
    clearAuthError,
  } = useProfile();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (otpDevCode?.length === 4) {
      setCode(otpDevCode);
    }
  }, [otpDevCode]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const authErrorMessage = () => {
    if (authError === "otp_invalid") return t("auth.otpInvalid");
    if (authError === "otp_expired") return t("auth.otpExpired");
    if (authError === "otp_too_many_attempts") return t("auth.otpTooManyAttempts");
    if (authError === "otp_verify_failed") return t("auth.otpVerifyFailed");
    if (authError === "otp_session_missing") return t("auth.otpSessionMissing");
    return null;
  };

  const handleVerify = async () => {
    clearAuthError();
    const result = await verifyOtp(code);
    if (result === "existing") navigate("/home", { replace: true });
    else if (result === "onboarding") navigate("/onboarding", { replace: true });
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || !pendingPhone) return;
    clearAuthError();
    const ok = await sendOtp(pendingPhone);
    if (ok) {
      setSecondsLeft(RESEND_SECONDS);
      setCode("");
    }
  };

  const handleBack = () => {
    clearAuthError();
    navigate("/phone");
  };

  return (
    <AuthScreen
      centerHeader
      footer={
        <>
          <PrimaryPillButton
            disabled={code.length !== 4 || saving}
            fullWidth
            label={t("auth.verifyCode")}
            loading={saving}
            onPress={() => void handleVerify()}
          />
          <button
            type="button"
            className="mt-4 w-full py-2 font-poppins-medium text-base disabled:opacity-50"
            style={{
              color: secondsLeft > 0 ? theme.textMuted : theme.ctaPrimary,
            }}
            disabled={secondsLeft > 0 || saving}
            onClick={() => void handleResend()}
          >
            {secondsLeft > 0
              ? t("auth.resendIn", { seconds: secondsLeft })
              : t("auth.resendCode")}
          </button>
        </>
      }
      onBack={handleBack}
      showBack
      subtitle={t("auth.otpSubtitle", { phone: pendingPhone })}
      title={t("auth.otpTitle")}
    >
      {authErrorMessage() ? (
        <AlertBanner message={authErrorMessage()!} variant="error" />
      ) : null}
      <OtpInput
        devCode={otpDevCode}
        devNotice={otpDevCode ? t("auth.otpDevNotice") : undefined}
        disabled={saving}
        value={code}
        onChange={setCode}
      />
    </AuthScreen>
  );
}
