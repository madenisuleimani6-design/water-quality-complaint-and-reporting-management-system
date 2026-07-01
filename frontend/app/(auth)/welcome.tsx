import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { AuthFeatureList } from "../../components/auth/AuthFeatureList";
import { AuthHeroGraphic } from "../../components/auth/AuthHeroGraphic";
import { AuthScreen } from "../../components/auth/AuthScreen";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";

export default function WelcomeScreen() {
  const { t } = useTranslation();

  const features = [
    { icon: "report-problem" as const, label: t("auth.welcomeFeatureReport") },
    { icon: "track-changes" as const, label: t("auth.welcomeFeatureTrack") },
    { icon: "chat" as const, label: t("auth.welcomeFeatureMessage") },
  ];

  return (
    <AuthScreen
      centerHeader
      footer={
        <PrimaryPillButton
          fullWidth
          label={t("auth.continueWithPhone")}
          onPress={() => router.push("/(auth)/phone")}
        />
      }
      hero={<AuthHeroGraphic />}
      subtitle={t("auth.welcomeSubtitle")}
      title={t("auth.welcomeTitle")}
    >
      <AuthFeatureList features={features} />
    </AuthScreen>
  );
}
