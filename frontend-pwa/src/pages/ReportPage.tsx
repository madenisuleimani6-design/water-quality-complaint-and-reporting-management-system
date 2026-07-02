import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CameraCapture } from "@/components/report/CameraCapture";
import { LocationBadge } from "@/components/report/LocationBadge";
import { useReportPhoto } from "@/contexts/ReportPhotoContext";
import { useLocation } from "@/hooks/useLocation";
import { fetchAccurateLocation } from "@/lib/geolocation";
import { preparePhotoForUpload } from "@/utils/imageCompression";

export function ReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation({ watch: true });
  const { setDraft } = useReportPhoto();
  const [processing, setProcessing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const busy = processing;
  const locationBottom = "calc(7rem + env(safe-area-inset-bottom, 0px))";

  const handlePhotoReady = async (file: File) => {
    if (busy) return;
    setProcessing(true);
    setCaptureError(null);
    try {
      const [photoFile, capturedLocation] = await Promise.all([
        preparePhotoForUpload(file),
        fetchAccurateLocation(),
      ]);

      if (capturedLocation.latitude == null || capturedLocation.longitude == null) {
        setCaptureError("location_required");
        return;
      }

      setDraft({
        photoUri: URL.createObjectURL(photoFile),
        photoFile,
        latitude: capturedLocation.latitude,
        longitude: capturedLocation.longitude,
        areaName: capturedLocation.areaName,
      });
      navigate("/report/confirm");
    } catch {
      setCaptureError("photo_failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-black">
      <CameraCapture
        isCapturing={busy}
        onClose={() => navigate(-1)}
        onPhotoReady={handlePhotoReady}
      />
      <div
        className="pointer-events-none absolute left-4 right-4 z-20"
        style={{ bottom: locationBottom }}
      >
        <LocationBadge
          areaName={location.areaName}
          latitude={location.latitude?.toString() ?? null}
          loading={location.loading}
          longitude={location.longitude?.toString() ?? null}
        />
      </div>
      {!location.loading && !location.latitude ? (
        <p
          className="pointer-events-none absolute left-0 right-0 z-20 px-6 text-center font-poppins text-sm text-amber-200"
          style={{ bottom: "calc(10.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {t("camera.locationDenied")}
        </p>
      ) : null}
      {captureError === "location_required" ? (
        <p
          className="pointer-events-none absolute left-0 right-0 z-20 px-6 text-center font-poppins text-sm text-red-300"
          style={{ bottom: "calc(13rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {t("camera.locationRequired")}
        </p>
      ) : null}
      {captureError === "photo_failed" ? (
        <p
          className="pointer-events-none absolute left-0 right-0 z-20 px-6 text-center font-poppins text-sm text-red-300"
          style={{ bottom: "calc(13rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {t("camera.photoFailed")}
        </p>
      ) : null}
    </div>
  );
}
