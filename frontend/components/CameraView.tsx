import { RefObject, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { CameraView as ExpoCameraView } from "expo-camera";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../constants/theme";
import { isWeb } from "../utils/platform";

type CameraViewProps = {
  cameraRef: RefObject<ExpoCameraView | null>;
  onPhotoReady: (uri?: string) => Promise<void>;
  onRequestPermission: () => Promise<boolean>;
  isCapturing: boolean;
  permissionDenied: boolean;
  topBarLeft?: React.ReactNode;
};

export function CameraView({
  cameraRef,
  onPhotoReady,
  onRequestPermission,
  isCapturing,
  permissionDenied,
  topBarLeft,
}: CameraViewProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (isWeb) {
    return (
      <View className="flex-1 bg-black">
        <SafeAreaView className="z-10 shrink-0" edges={["top"]}>
          <View
            className="flex-row items-center justify-center px-4 pb-3"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            {topBarLeft ? <View className="absolute left-4">{topBarLeft}</View> : null}
            <Text className="font-poppins-medium text-base text-white">
              {t("camera.title")}
            </Text>
          </View>
        </SafeAreaView>

        <View className="flex-1" />

        <SafeAreaView className="z-10 shrink-0 items-center px-6 pt-6" edges={["bottom"]}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onPhotoReady(URL.createObjectURL(file));
              }
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("camera.capture")}
            className="h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white"
            disabled={isCapturing}
            style={{ backgroundColor: theme.ctaPrimary, opacity: isCapturing ? 0.6 : 1 }}
            onPress={() => {
              if (!isCapturing) {
                fileInputRef.current?.click();
              }
            }}
          >
            {isCapturing ? (
              <ActivityIndicator color={theme.textOnPrimary} />
            ) : (
              <View className="h-12 w-12 rounded-full bg-white" />
            )}
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="mb-4 text-center text-base text-white">
          {t("camera.permissionDenied")}
        </Text>
        <Pressable
          className="rounded-full px-5 py-3"
          style={{ backgroundColor: theme.ctaPrimary }}
          onPress={onRequestPermission}
        >
          <Text className="font-semibold text-white">{t("camera.capture")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ExpoCameraView ref={cameraRef} facing="back" style={{ flex: 1 }} />
      <SafeAreaView
        className="absolute left-0 right-0 top-0 z-10"
        edges={["top"]}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View className="flex-row items-center justify-center px-4 pb-3">
          {topBarLeft ? <View className="absolute left-4">{topBarLeft}</View> : null}
          <Text className="font-poppins-medium text-base text-white">
            {t("camera.title")}
          </Text>
        </View>
      </SafeAreaView>
      <SafeAreaView
        className="absolute bottom-0 left-0 right-0 z-10 items-center px-6 pb-6 pt-4"
        edges={["bottom"]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("camera.capture")}
          className="h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white"
          disabled={isCapturing}
          style={{ opacity: isCapturing ? 0.6 : 1 }}
          onPress={async () => {
            if (isCapturing) {
              return;
            }
            const allowed = await onRequestPermission();
            if (!allowed) {
              return;
            }
            await onPhotoReady();
          }}
        >
          {isCapturing ? (
            <ActivityIndicator color={theme.textOnPrimary} />
          ) : (
            <View
              className="h-12 w-12 rounded-full border-2"
              style={{ backgroundColor: theme.textOnPrimary, borderColor: theme.ctaPrimary }}
            />
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
