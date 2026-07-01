import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AuthPhoneHero } from "../../components/auth/AuthPhoneHero";
import { AuthScreen } from "../../components/auth/AuthScreen";
import { PhoneNumberInput } from "../../components/auth/PhoneNumberInput";
import { AlertBanner } from "../../components/AlertBanner";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";
import { theme } from "../../constants/theme";
import { useProfile } from "../../hooks/useProfile";
import { isValidTzPhone, normalizeTzPhone } from "../../utils/phoneValidation";

export default function PhoneScreen() {
  const { t } = useTranslation();
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
    if (ok) {
      router.push("/(auth)/otp");
    }
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

      <View
        className="mt-2 flex-row items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: theme.card, ...theme.shadow.cardSubtle }}
      >
        <View
          className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.success.bg }}
        >
          <MaterialIcons color={theme.status.resolved} name="lock-outline" size={16} />
        </View>
        <Text className="flex-1 font-poppins text-sm leading-5 text-slate-500">
          {t("auth.phonePrivacy")}
        </Text>
      </View>
    </AuthScreen>
  );
}
