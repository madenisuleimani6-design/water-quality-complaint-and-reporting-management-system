import { AlertTriangle, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AuthFeatureList } from "@/components/auth/AuthFeatureList";
import { AuthHeroGraphic } from "@/components/auth/AuthHeroGraphic";
import { AuthScreen } from "@/components/layout/AuthScreen";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";

export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { icon: AlertTriangle, label: t("auth.welcomeFeatureReport") },
    { icon: TrendingUp, label: t("auth.welcomeFeatureTrack") },
    { icon: MessageSquare, label: t("auth.welcomeFeatureMessage") },
  ];

  return (
    <AuthScreen
      centerHeader
      footer={
        <PrimaryPillButton
          fullWidth
          label={t("auth.continueWithPhone")}
          onPress={() => navigate("/phone")}
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
