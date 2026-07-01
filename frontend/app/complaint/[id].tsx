import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "../../components/AlertBanner";
import { Card } from "../../components/Card";
import { ContentSheet } from "../../components/ContentSheet";
import { GradientHeader, HeaderBackButton } from "../../components/GradientHeader";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { StatusTracker } from "../../components/StatusTracker";
import { theme } from "../../constants/theme";
import { useComplaintStatus } from "../../hooks/useComplaintStatus";
import { fetchComplaintDetail } from "../../services/complaints";
import { ComplaintDetail } from "../../types/citizen";

function formatSubmittedAt(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function ComplaintDetailScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const complaintId = params.id;
  const { status } = useComplaintStatus(complaintId);
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!complaintId) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void fetchComplaintDetail(complaintId)
      .then((data) => {
        if (!cancelled) {
          setComplaint(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [complaintId]);

  const liveStatus = complaint?.status ?? status;

  return (
    <ResponsiveShell variant="light">
      <StatusBar style="dark" />
      <View className="flex-1" style={{ backgroundColor: theme.surface }}>
        <GradientHeader
          leftAction={<HeaderBackButton onPress={() => router.back()} />}
          title={t("complaintDetail.title")}
        />
        <ContentSheet withBottomSafeArea>
          {loading ? (
            <View className="flex-1 items-center justify-center py-16">
              <ActivityIndicator color={theme.tabActive} size="large" />
            </View>
          ) : error || !complaint ? (
            <View className="py-8">
              <AlertBanner message={t("complaintDetail.loadError")} variant="error" />
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerClassName="pb-8"
              showsVerticalScrollIndicator={false}
            >
              <Card className="mb-4 overflow-hidden p-0">
                {complaint.photoUrl ? (
                  <Image
                    className="h-56 w-full bg-slate-100"
                    resizeMode="cover"
                    source={{ uri: complaint.photoUrl }}
                  />
                ) : (
                  <View className="h-56 w-full items-center justify-center bg-slate-100">
                    <MaterialIcons color={theme.tabInactive} name="image" size={40} />
                  </View>
                )}
              </Card>

              <Card className="mb-4 p-4">
                <Text className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                  {t("complaintDetail.submittedOn")}
                </Text>
                <Text className="mt-1 font-poppins-semibold text-base text-slate-900">
                  {formatSubmittedAt(complaint.submittedAt, i18n.language)}
                </Text>

                <View className="my-4 h-px bg-slate-100" />

                <Text className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                  {t("complaintDetail.location")}
                </Text>
                <Text className="mt-1 font-poppins-semibold text-base text-slate-900">
                  {complaint.areaName || t("confirm.locationUnavailable")}
                </Text>

                <View className="my-4 h-px bg-slate-100" />

                <Text className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                  {t("complaintDetail.yourNote")}
                </Text>
                <Text className="mt-1 font-poppins text-base leading-6 text-slate-700">
                  {complaint.note?.trim() || t("home.noNote")}
                </Text>
              </Card>

              <Card className="p-5">
                <Text className="mb-4 font-poppins-semibold text-base text-slate-900">
                  {t("complaintDetail.progressTitle")}
                </Text>
                <StatusTracker status={liveStatus as "new" | "assigned" | "investigating" | "resolved"} />
              </Card>
            </ScrollView>
          )}
        </ContentSheet>
      </View>
    </ResponsiveShell>
  );
}
