import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/Card";
import { ContentSheet } from "../../components/ContentSheet";
import { FadeInView } from "../../components/FadeInView";
import { GradientHeader } from "../../components/GradientHeader";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { SectionTitle } from "../../components/SectionTitle";
import { StatusTracker } from "../../components/StatusTracker";
import { theme } from "../../constants/theme";
import { useComplaintStatus } from "../../hooks/useComplaintStatus";

export default function ReportSubmittedScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ complaintId?: string }>();
  const { status } = useComplaintStatus(params.complaintId);

  return (
    <ResponsiveShell variant="light">
      <StatusBar style="dark" />
      <View className="flex-1" style={{ backgroundColor: theme.surface }}>
        <GradientHeader title={t("submitted.title")} />
        <ContentSheet className="items-center" withBottomSafeArea>
          <ScrollView
            className="w-full flex-1"
            contentContainerClassName="flex-grow items-center justify-center py-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FadeInView className="w-full items-center">
              <View
                className="mb-6 h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.feedback.info.bg }}
              >
                <MaterialIcons color={theme.ctaPrimary} name="check-circle" size={48} />
              </View>
              <SectionTitle
                subtitle={t("submitted.subtitle")}
                title={t("submitted.thankYou")}
              />

              <Card className="mb-8 mt-2 w-full p-5">
                <StatusTracker status={status} />
              </Card>

              <View className="w-full gap-3">
                <PrimaryPillButton
                  label={t("submitted.backHome")}
                  onPress={() => router.replace("/(tabs)")}
                />
                <PrimaryPillButton
                  label={t("submitted.reportAnother")}
                  variant="dashed"
                  onPress={() => router.replace("/report")}
                />
              </View>
            </FadeInView>
          </ScrollView>
        </ContentSheet>
      </View>
    </ResponsiveShell>
  );
}
