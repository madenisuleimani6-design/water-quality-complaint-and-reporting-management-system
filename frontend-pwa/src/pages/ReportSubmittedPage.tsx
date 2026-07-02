import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/layout/Card";
import { GradientHeader } from "@/components/layout/GradientHeader";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { StatusTracker } from "@/components/report/StatusTracker";
import { CONTENT_SHEET_TOP_PADDING } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { useComplaintStatus } from "@/hooks/useComplaintStatus";

const SUCCESS_REDIRECT_MS = 3500;

export function ReportSubmittedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const complaintId = searchParams.get("complaintId") ?? undefined;
  const { status } = useComplaintStatus(complaintId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/home", { replace: true, state: { refreshComplaints: true } });
    }, SUCCESS_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: theme.surface }}>
      <GradientHeader title={t("submitted.title")} />
      <div
        className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-4"
        style={{ paddingTop: CONTENT_SHEET_TOP_PADDING }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center"
        >
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.feedback.info.bg }}
          >
            <CheckCircle className="h-12 w-12" style={{ color: theme.ctaPrimary }} />
          </div>
          <h2 className="text-center font-poppins-bold text-xl text-slate-900">
            {t("submitted.thankYou")}
          </h2>
          <p className="mt-2 max-w-sm text-center font-poppins text-sm text-slate-500">
            {t("submitted.subtitle")}
          </p>
          <p className="mt-3 text-center font-poppins text-xs text-slate-400">
            {t("submitted.redirectingHome")}
          </p>

          <Card className="mb-8 mt-6 w-full p-5">
            <StatusTracker status={status} />
          </Card>

          <div className="flex w-full flex-col gap-3">
            <PrimaryPillButton
              label={t("submitted.backHome")}
              onPress={() =>
                navigate("/home", { replace: true, state: { refreshComplaints: true } })
              }
            />
            <PrimaryPillButton
              label={t("submitted.reportAnother")}
              variant="dashed"
              onPress={() => navigate("/report", { replace: true })}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
