import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AuthOnboardingHero } from "../../components/auth/AuthOnboardingHero";
import { AuthScreen } from "../../components/auth/AuthScreen";
import { AlertBanner } from "../../components/AlertBanner";
import { OnboardingForm } from "../../components/OnboardingForm";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";
import { AppLanguage } from "../../constants/config";
import { theme } from "../../constants/theme";
import { useProfile } from "../../hooks/useProfile";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { completeOnboarding, profile, saving, errors, authError, clearAuthError } =
    useProfile();
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>(profile.preferredLanguage);

  const nameError = () => {
    if (errors.fullName === "required") return t("common.required");
    return undefined;
  };

  const authErrorMessage = () => {
    if (authError === "phone_already_registered") {
      return t("auth.phoneAlreadyRegistered");
    }
    if (authError === "register_failed") return t("auth.registerFailed");
    return null;
  };

  const handleContinue = async () => {
    clearAuthError();
    const ok = await completeOnboarding({ fullName, preferredLanguage: language });
    if (ok) {
      router.replace("/(tabs)");
    }
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
      <View className="mt-6">
        <OnboardingForm
        fullName={fullName}
        language={language}
        nameError={nameError()}
        onChangeFullName={setFullName}
        onChangeLanguage={setLanguage}
        />
      </View>

      <View
        className="mt-2 flex-row items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: theme.card, ...theme.shadow.cardSubtle }}
      >
        <View
          className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <MaterialIcons color={theme.ctaPrimary} name="info-outline" size={16} />
        </View>
        <Text className="flex-1 font-poppins text-sm leading-5 text-slate-500">
          {t("auth.onboardingPrivacy")}
        </Text>
      </View>
    </AuthScreen>
  );
}
