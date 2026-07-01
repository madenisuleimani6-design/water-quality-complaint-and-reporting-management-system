import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { isWeb } from "../utils/platform";

const DISMISS_KEY = "dawasa_install_prompt_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosSafari() {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") {
      return;
    }
    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIosSafari()) {
      setIosHint(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!isWeb || !visible) {
    return null;
  }

  return (
    <View className="mx-4 mb-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
      <Text className="font-poppins-semibold text-sm text-slate-900">
        {t("pwa.installTitle")}
      </Text>
      <Text className="mt-1 font-poppins text-xs leading-5 text-slate-600">
        {iosHint ? t("pwa.installIosHint") : t("pwa.installAndroidHint")}
      </Text>
      <View className="mt-3 flex-row gap-2">
        {!iosHint ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-[44px] flex-1 items-center justify-center rounded-full px-4"
            style={{ backgroundColor: theme.tabActive }}
            onPress={install}
          >
            <Text className="font-poppins-semibold text-sm text-white">
              {t("pwa.installAction")}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-slate-200 px-4"
          onPress={dismiss}
        >
          <Text className="font-poppins-semibold text-sm text-slate-700">
            {t("pwa.installDismiss")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
