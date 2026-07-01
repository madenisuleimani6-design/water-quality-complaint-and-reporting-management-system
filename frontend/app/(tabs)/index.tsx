import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { ComplaintListItem } from "../../components/ComplaintListItem";
import { ContentSheet } from "../../components/ContentSheet";
import { EmptyHomeState } from "../../components/EmptyHomeState";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { GradientHeader } from "../../components/GradientHeader";
import { HomeStatsBar } from "../../components/HomeStatsBar";
import { InstallPrompt } from "../../components/InstallPrompt";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { TAB_BAR_CONTENT_HEIGHT } from "../../constants/layout";
import { theme } from "../../constants/theme";
import { useBottomSafeInset } from "../../hooks/useBottomSafeInset";
import { useComplaints } from "../../hooks/useComplaints";
import { useProfile } from "../../hooks/useProfile";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile, ready: profileReady, isComplete } = useProfile();
  const { complaints, loading, refreshing, refetch } = useComplaints(
    profile.phone,
  );
  const bottomInset = useBottomSafeInset();
  const listBottomPadding = TAB_BAR_CONTENT_HEIGHT + bottomInset + 88;

  useFocusEffect(
    useCallback(() => {
      if (profileReady) {
        refetch();
      }
    }, [profileReady, refetch]),
  );

  const openReport = () => {
    if (!isComplete) {
      router.push("/(auth)/welcome");
      return;
    }
    router.push("/report");
  };

  const headerSubtitle = isComplete
    ? t("home.headerSubtitle")
    : t("home.headerSubtitleNoPhone");

  if (!profileReady || loading) {
    return (
      <ResponsiveShell variant="light">
        <StatusBar style="dark" />
        <View className="flex-1" style={{ backgroundColor: theme.surface }}>
          <GradientHeader subtitle={headerSubtitle} title={t("home.title")} />
          <ContentSheet className="items-center justify-center">
            <ActivityIndicator color={theme.tabActive} size="large" />
            <Text className="mt-3 font-poppins text-slate-500">{t("home.loading")}</Text>
          </ContentSheet>
        </View>
      </ResponsiveShell>
    );
  }

  const hasComplaints = complaints.length > 0;

  return (
    <ResponsiveShell variant="light">
      <StatusBar style="dark" />
      <View className="flex-1" style={{ backgroundColor: theme.surface }}>
        <GradientHeader subtitle={headerSubtitle} title={t("home.title")} />
        <ContentSheet>
          {isComplete ? <InstallPrompt /> : null}
          {hasComplaints ? (
            <>
              <HomeStatsBar totalReports={complaints.length} />
              <FlatList
                className="flex-1"
                contentContainerStyle={{
                  paddingBottom: listBottomPadding,
                  paddingTop: 4,
                }}
                data={complaints}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={refetch} />
                }
                renderItem={({ item }) => (
                  <ComplaintListItem
                    complaint={item}
                    onPress={() =>
                      router.push({
                        pathname: "/complaint/[id]",
                        params: { id: item.id },
                      })
                    }
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <EmptyHomeState
              missingPhone={!isComplete}
              onReportPress={openReport}
            />
          )}
        </ContentSheet>
        {hasComplaints ? (
          <FloatingActionButton
            accessibilityLabel={t("home.reportIssue")}
            onPress={openReport}
          />
        ) : null}
      </View>
    </ResponsiveShell>
  );
}
