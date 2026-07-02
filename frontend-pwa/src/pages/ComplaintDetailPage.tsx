import { ImageOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "@/components/layout/AlertBanner";
import { Card } from "@/components/layout/Card";
import { GradientHeader, HeaderBackButton } from "@/components/layout/GradientHeader";
import { StatusTracker } from "@/components/report/StatusTracker";
import { CONTENT_SHEET_TOP_PADDING } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { useComplaintStatus } from "@/hooks/useComplaintStatus";
import { fetchComplaintDetail } from "@/services/complaints";
import type { ComplaintDetail } from "@/types/citizen";

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

export function ComplaintDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: complaintId } = useParams<{ id: string }>();
  const { status } = useComplaintStatus(complaintId);
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

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
          setPhotoError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [complaintId]);

  const liveStatus = (complaint?.status ?? status) as
    | "new"
    | "assigned"
    | "investigating"
    | "resolved";

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: theme.surface }}>
      <GradientHeader
        leftAction={<HeaderBackButton onPress={() => navigate(-1)} />}
        title={t("complaintDetail.title")}
      />
      <div
        className="flex-1 overflow-y-auto px-4 pb-8"
        style={{ paddingTop: CONTENT_SHEET_TOP_PADDING }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.tabActive }} />
          </div>
        ) : error || !complaint ? (
          <div className="py-8">
            <AlertBanner message={t("complaintDetail.loadError")} variant="error" />
          </div>
        ) : (
          <>
            <Card className="mb-4 overflow-hidden p-0">
              {complaint.photoUrl && !photoError ? (
                <img
                  src={complaint.photoUrl}
                  alt=""
                  className="h-56 w-full bg-slate-100 object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center bg-slate-100">
                  <ImageOff className="h-10 w-10" style={{ color: theme.tabInactive }} />
                </div>
              )}
            </Card>

            <Card className="mb-4 p-4">
              <p className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                {t("complaintDetail.submittedOn")}
              </p>
              <p className="mt-1 font-poppins-semibold text-base text-slate-900">
                {formatSubmittedAt(complaint.submittedAt, i18n.language)}
              </p>

              <div className="my-4 h-px bg-slate-100" />

              <p className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                {t("complaintDetail.location")}
              </p>
              <p className="mt-1 font-poppins-semibold text-base text-slate-900">
                {complaint.areaName || t("confirm.locationUnavailable")}
              </p>

              <div className="my-4 h-px bg-slate-100" />

              <p className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
                {t("complaintDetail.yourNote")}
              </p>
              <p className="mt-1 font-poppins text-base leading-6 text-slate-700">
                {complaint.note?.trim() || t("home.noNote")}
              </p>
            </Card>

            <Card className="p-5">
              <p className="mb-4 font-poppins-semibold text-base text-slate-900">
                {t("complaintDetail.progressTitle")}
              </p>
              <StatusTracker status={liveStatus} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
