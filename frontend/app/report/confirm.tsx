import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "../../components/AlertBanner";
import { Card } from "../../components/Card";
import { ContentSheet } from "../../components/ContentSheet";
import { FormField } from "../../components/FormField";
import { GradientHeader, HeaderBackButton } from "../../components/GradientHeader";
import { KeyboardSafeScreen } from "../../components/KeyboardSafeScreen";
import { LocationBadge } from "../../components/LocationBadge";
import { NoteInput } from "../../components/NoteInput";
import { PrimaryPillButton } from "../../components/PrimaryPillButton";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { theme } from "../../constants/theme";
import { useReportPhoto } from "../../contexts/ReportPhotoContext";
import { useProfile } from "../../hooks/useProfile";
import { useSubmit } from "../../hooks/useSubmit";
import { isWeb } from "../../utils/platform";

export default function ReportConfirmScreen() {
  const { t } = useTranslation();
  const { profile, isComplete } = useProfile();
  const { draft, clearDraft } = useReportPhoto();
  const [note, setNote] = useState("");
  const [manualArea, setManualArea] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { submit, isSubmitting, error, queuedOffline, clearError } = useSubmit();

  useEffect(() => {
    if (!draft?.photoUri) {
      router.replace("/report");
    }
  }, [draft?.photoUri]);

  if (!draft?.photoUri) {
    return null;
  }

  const { photoUri, latitude, longitude, areaName } = draft;
  const showManualArea =
    isWeb && !areaName && latitude == null && longitude == null;

  const handleRetake = () => {
    clearDraft();
    router.back();
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      router.replace("/(auth)/welcome");
      return;
    }

    clearError();
    const trimmedArea = manualArea.trim();
    const combinedNote = trimmedArea
      ? note.trim()
        ? `${trimmedArea}: ${note.trim()}`
        : trimmedArea
      : note;
    const result = await submit({
      photoUri,
      latitude,
      longitude,
      note: combinedNote,
      phone: profile.phone,
      reporterName: profile.fullName,
    });

    if (result.success && !result.queued && result.complaintId) {
      clearDraft();
      router.replace({
        pathname: "/report/submitted",
        params: { complaintId: result.complaintId },
      });
      return;
    }

    if (result.success && result.queued) {
      clearDraft();
      router.replace("/report/submitted");
    }
  };

  return (
    <ResponsiveShell variant="light">
      <StatusBar style="dark" />
      <View className="flex-1" style={{ backgroundColor: theme.surface }}>
        <GradientHeader
          leftAction={
            <HeaderBackButton
              accessibilityLabel={t("common.back")}
              onPress={handleRetake}
            />
          }
          title={t("confirm.title")}
        />
        <ContentSheet withBottomSafeArea>
          <KeyboardSafeScreen>
            <Card className="relative mb-4 overflow-hidden bg-slate-200">
              <Image
                accessibilityLabel="Captured photo preview"
                className="h-64 w-full"
                resizeMode="cover"
                source={{ uri: photoUri }}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading ? (
                <View className="absolute inset-0 items-center justify-center bg-slate-200/80">
                  <ActivityIndicator color={theme.tabActive} size="large" />
                </View>
              ) : null}
            </Card>

            {imageError ? (
              <AlertBanner message={t("confirm.imageLoadError")} variant="error" />
            ) : null}

            <LocationBadge
              areaName={areaName ?? (manualArea.trim() || null)}
              latitude={latitude?.toString() ?? null}
              longitude={longitude?.toString() ?? null}
            />

            {showManualArea ? (
              <View className="mt-3">
                <FormField
                  label={t("confirm.areaManualLabel")}
                  placeholder={t("confirm.areaManualPlaceholder")}
                  value={manualArea}
                  onChangeText={setManualArea}
                />
              </View>
            ) : null}

            <View className="my-4">
              <NoteInput value={note} onChangeText={setNote} />
            </View>

            {queuedOffline ? (
              <AlertBanner message={t("confirm.offlineMessage")} variant="warning" />
            ) : null}

            {error === "queue_full" ? (
              <AlertBanner message={t("confirm.queueFull")} variant="error" />
            ) : error ? (
              <AlertBanner message={t("confirm.submitError")} variant="error" />
            ) : null}

            <View className="mb-3">
              <PrimaryPillButton
                label={t("confirm.retake")}
                variant="outline"
                onPress={handleRetake}
              />
            </View>

            <PrimaryPillButton
              disabled={imageLoading || imageError}
              label={t("confirm.submit")}
              loading={isSubmitting}
              onPress={handleSubmit}
            />
          </KeyboardSafeScreen>
        </ContentSheet>
      </View>
    </ResponsiveShell>
  );
}
