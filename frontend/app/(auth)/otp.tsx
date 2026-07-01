import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { AuthScreen } from "../../components/auth/AuthScreen";
import { AlertBanner } from "../../components/AlertBanner";
import { OtpInput } from "../../components/OtpInput";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";
import { theme } from "../../constants/theme";
import { useProfile } from "../../hooks/useProfile";

const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const { t } = useTranslation();
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
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
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
    if (result === "existing") {
      router.replace("/(tabs)");
    } else if (result === "onboarding") {
      router.replace("/(auth)/onboarding");
    }
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
          <Pressable
            accessibilityRole="button"
            className="mt-4 py-2"
            disabled={secondsLeft > 0 || saving}
            onPress={() => void handleResend()}
          >
            <Text
              className="text-center font-poppins-medium text-base"
              style={{
                color: secondsLeft > 0 ? theme.textMuted : theme.ctaPrimary,
              }}
            >
              {secondsLeft > 0
                ? t("auth.resendIn", { seconds: secondsLeft })
                : t("auth.resendCode")}
            </Text>
          </Pressable>
        </>
      }
      showBack
      subtitle={t("auth.otpSubtitle", { phone: pendingPhone })}
      title={t("auth.otpTitle")}
    >
      {authErrorMessage() ? (
        <AlertBanner message={authErrorMessage()!} variant="error" />
      ) : null}
      {otpDevCode ? (
        <AlertBanner message={t("auth.otpDevNotice")} variant="info">
          <Text
            accessibilityLabel={t("auth.otpDevHint", { code: otpDevCode })}
            className="mt-3 text-center font-poppins-bold text-2xl tracking-[8px] text-slate-900"
          >
            {otpDevCode}
          </Text>
        </AlertBanner>
      ) : null}
      <OtpInput disabled={saving} value={code} onChange={setCode} />
    </AuthScreen>
  );
}
