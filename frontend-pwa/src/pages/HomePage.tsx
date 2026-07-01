import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ComplaintListItem } from "@/components/home/ComplaintListItem";
import { EmptyHomeState } from "@/components/home/EmptyHomeState";
import { FloatingActionButton } from "@/components/home/FloatingActionButton";
import { HomeStatsBar } from "@/components/home/HomeStatsBar";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { TAB_BAR_CONTENT_HEIGHT } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { useComplaints } from "@/hooks/useComplaints";
import { useProfile } from "@/hooks/useProfile";

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, ready: profileReady, isComplete } = useProfile();
  const { complaints, loading, refreshing, refetch } = useComplaints(profile.phone);

  useEffect(() => {
    if (profileReady) refetch();
  }, [profileReady, refetch]);

  const openReport = () => {
    if (!isComplete) {
      navigate("/welcome");
      return;
    }
    navigate("/report");
  };

  const headerSubtitle = isComplete
    ? t("home.headerSubtitle")
    : t("home.headerSubtitleNoPhone");

  const listBottomPadding = TAB_BAR_CONTENT_HEIGHT + 88;

  if (!profileReady || loading) {
    return (
      <TabScreenLayout subtitle={headerSubtitle} title={t("home.title")}>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.tabActive }} />
          <p className="mt-3 font-poppins text-slate-500">{t("home.loading")}</p>
        </div>
      </TabScreenLayout>
    );
  }

  const hasComplaints = complaints.length > 0;

  return (
    <TabScreenLayout subtitle={headerSubtitle} title={t("home.title")}>
      {hasComplaints ? (
        <>
          <HomeStatsBar totalReports={complaints.length} />
          <div style={{ paddingBottom: listBottomPadding }}>
            {refreshing ? (
              <p className="mb-2 text-center font-poppins text-xs text-slate-400">
                {t("home.loading")}
              </p>
            ) : null}
            {complaints.map((item) => (
              <ComplaintListItem
                key={item.id}
                complaint={item}
                onPress={() => navigate(`/complaint/${item.id}`)}
              />
            ))}
          </div>
          <FloatingActionButton
            accessibilityLabel={t("home.reportIssue")}
            onPress={openReport}
          />
        </>
      ) : (
        <EmptyHomeState missingPhone={!isComplete} onReportPress={openReport} />
      )}
    </TabScreenLayout>
  );
}
