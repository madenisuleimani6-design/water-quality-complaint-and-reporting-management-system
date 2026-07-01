import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "@/components/layout/AlertBanner";
import { Card } from "@/components/layout/Card";
import { GradientHeader, HeaderBackButton } from "@/components/layout/GradientHeader";
import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { Input } from "@/components/ui/input";
import { LocationBadge } from "@/components/report/LocationBadge";
import { NoteInput } from "@/components/report/NoteInput";
import { CONTENT_SHEET_TOP_PADDING } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { useReportPhoto } from "@/contexts/ReportPhotoContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubmit } from "@/hooks/useSubmit";

export function ReportConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, isComplete } = useProfile();
  const { draft, clearDraft } = useReportPhoto();
  const [note, setNote] = useState("");
  const [manualArea, setManualArea] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { submit, isSubmitting, error, queuedOffline, clearError } = useSubmit();

  useEffect(() => {
    if (!draft?.photoUri) navigate("/report", { replace: true });
  }, [draft?.photoUri, navigate]);

  if (!draft?.photoUri) return null;

  const { photoUri, latitude, longitude, areaName } = draft;
  const showManualArea = !areaName && latitude == null && longitude == null;

  const handleRetake = () => {
    clearDraft();
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      navigate("/welcome", { replace: true });
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
      navigate(`/report/submitted?complaintId=${result.complaintId}`, { replace: true });
      return;
    }

    if (result.success && result.queued) {
      clearDraft();
      navigate("/report/submitted", { replace: true });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: theme.surface }}>
      <GradientHeader
        leftAction={
          <HeaderBackButton
            accessibilityLabel={t("common.back")}
            onPress={handleRetake}
          />
        }
        title={t("confirm.title")}
      />
      <div
        className="flex-1 overflow-y-auto px-4 pb-8"
        style={{ paddingTop: CONTENT_SHEET_TOP_PADDING }}
      >
        <Card className="relative mb-4 overflow-hidden bg-slate-200 p-0">
          <img
            src={photoUri}
            alt="Captured photo preview"
            className="h-64 w-full object-cover"
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            onLoad={() => setImageLoading(false)}
          />
          {imageLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200/80">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.tabActive }} />
            </div>
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
          <div className="mt-3">
            <label className="mb-2 block font-poppins-medium text-sm text-slate-700">
              {t("confirm.areaManualLabel")}
            </label>
            <Input
              value={manualArea}
              placeholder={t("confirm.areaManualPlaceholder")}
              onChange={(e) => setManualArea(e.target.value)}
            />
          </div>
        ) : null}

        <div className="my-4">
          <NoteInput value={note} onChangeText={setNote} />
        </div>

        {queuedOffline ? (
          <AlertBanner message={t("confirm.offlineMessage")} variant="warning" />
        ) : null}

        {error === "queue_full" ? (
          <AlertBanner message={t("confirm.queueFull")} variant="error" />
        ) : error ? (
          <AlertBanner message={t("confirm.submitError")} variant="error" />
        ) : null}

        <div className="mb-3">
          <PrimaryPillButton
            label={t("confirm.retake")}
            variant="outline"
            onPress={handleRetake}
          />
        </div>

        <PrimaryPillButton
          disabled={imageLoading || imageError}
          label={t("confirm.submit")}
          loading={isSubmitting}
          onPress={() => void handleSubmit()}
        />
      </div>
    </div>
  );
}
