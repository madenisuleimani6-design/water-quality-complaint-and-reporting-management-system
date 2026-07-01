import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CameraCapture } from "@/components/report/CameraCapture";
import { LocationBadge } from "@/components/report/LocationBadge";
import { useReportPhoto } from "@/contexts/ReportPhotoContext";
import { useLocation } from "@/hooks/useLocation";
import { compressImage } from "@/utils/imageCompression";

export function ReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDraft } = useReportPhoto();
  const [processing, setProcessing] = useState(false);

  const busy = processing;
  const locationBottom = "calc(7rem + env(safe-area-inset-bottom, 0px))";

  const handlePhotoReady = async (uri: string) => {
    if (busy) return;
    setProcessing(true);
    try {
      const compressedUri = await compressImage(uri);
      setDraft({
        photoUri: compressedUri,
        latitude: location.latitude,
        longitude: location.longitude,
        areaName: location.areaName,
      });
      navigate("/report/confirm");
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
      {!location.loading && !location.areaName && !location.latitude ? (
        <p
          className="pointer-events-none absolute left-0 right-0 z-20 text-center font-poppins text-sm text-white/80"
          style={{ bottom: "calc(10.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {t("camera.locationDenied")}
        </p>
      ) : null}
    </div>
  );
}
