import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { CameraView } from "../../components/CameraView";
import { IconCircleButton } from "../../components/IconCircleButton";
import { LocationBadge } from "../../components/LocationBadge";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { useReportPhoto } from "../../contexts/ReportPhotoContext";
import { useCamera } from "../../hooks/useCamera";
import { useBottomSafeInset } from "../../hooks/useBottomSafeInset";
import { useLocation } from "../../hooks/useLocation";
import { compressImage } from "../../utils/imageCompression";

export default function ReportCameraScreen() {
  const { t } = useTranslation();
  const bottomInset = useBottomSafeInset();
  const { cameraRef, ensurePermission, isCapturing, permissionDenied, takePhoto } =
    useCamera();
  const location = useLocation();
  const { setDraft } = useReportPhoto();
  const [processing, setProcessing] = useState(false);

  const shutterBottom = bottomInset + 24;
  const locationBottom = shutterBottom + 88;
  const busy = isCapturing || processing;

  useEffect(() => {
    ensurePermission();
  }, [ensurePermission]);

  const handlePhotoReady = async (uri?: string) => {
    if (busy) {
      return;
    }

    setProcessing(true);
    try {
      const rawUri = uri ?? (await takePhoto());
      if (!rawUri) {
        return;
      }

      const compressedUri = await compressImage(rawUri);
      setDraft({
        photoUri: compressedUri,
        latitude: location.latitude,
        longitude: location.longitude,
        areaName: location.areaName,
      });
      router.push("/report/confirm");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ResponsiveShell safeAreaEdges={[]} variant="dark">
      <View className="flex-1 bg-black">
        <CameraView
          cameraRef={cameraRef}
          isCapturing={busy}
          permissionDenied={permissionDenied}
          topBarLeft={
            <IconCircleButton
              accessibilityLabel={t("common.close")}
              dark
              icon="close"
              onPress={() => router.back()}
            />
          }
          onPhotoReady={handlePhotoReady}
          onRequestPermission={ensurePermission}
        />
        <View
          className="absolute left-4 right-4"
          style={{ bottom: locationBottom }}
        >
          <LocationBadge
            areaName={location.areaName}
            latitude={location.latitude?.toString() ?? null}
            loading={location.loading}
            longitude={location.longitude?.toString() ?? null}
          />
        </View>
        {!location.loading && !location.areaName && !location.latitude ? (
          <Text
            className="absolute left-0 right-0 text-center font-poppins text-sm text-white/80"
            style={{ bottom: locationBottom + 56 }}
          >
            {t("camera.locationDenied")}
          </Text>
        ) : null}
      </View>
    </ResponsiveShell>
  );
}
