import { useCallback, useRef, useState } from "react";
import { CameraView as ExpoCameraView, useCameraPermissions } from "expo-camera";

export function useCamera() {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  const isReady = Boolean(permission?.granted);

  const ensurePermission = useCallback(async () => {
    if (permission?.granted) {
      return true;
    }
    const result = await requestPermission();
    return result.granted;
  }, [permission?.granted, requestPermission]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) {
      return null;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      return photo?.uri ?? null;
    } catch {
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    cameraRef,
    isReady,
    isCapturing,
    permissionDenied: permission?.status === "denied",
    ensurePermission,
    takePhoto,
  };
}
