import { Loader2, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants/theme";

type CameraCaptureProps = {
  onPhotoReady: (uri: string) => Promise<void>;
  isCapturing: boolean;
  onClose: () => void;
};

export function CameraCapture({
  onPhotoReady,
  isCapturing,
  onClose,
}: CameraCaptureProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col bg-black">
      <header
        className="z-10 flex shrink-0 items-center justify-center px-4 pb-3 pt-safe"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <button
          type="button"
          aria-label={t("common.close")}
          onClick={onClose}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <p className="font-poppins-medium text-base text-white">{t("camera.title")}</p>
      </header>

      <div className="flex-1" aria-hidden />

      <footer
        className="z-10 flex shrink-0 flex-col items-center px-6 pt-6"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onPhotoReady(URL.createObjectURL(file));
          }}
        />
        <button
          type="button"
          disabled={isCapturing}
          aria-label={t("camera.capture")}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: theme.ctaPrimary }}
          onClick={() => {
            if (!isCapturing) fileInputRef.current?.click();
          }}
        >
          {isCapturing ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-white" />
          )}
        </button>
      </footer>
    </div>
  );
}
