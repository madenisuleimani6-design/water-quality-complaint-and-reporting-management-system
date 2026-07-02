import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { tabBarInset } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

const TAB_ROUTES = ["/home", "/messages", "/profile"];

const APP_ICON = "/icon.png";

type InstallPromptProps = {
  className?: string;
};

export function InstallPrompt({ className }: InstallPromptProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { visible, iosHint, canInstall, dismiss, install } = usePwaInstall();

  if (!visible) return null;

  const onTabRoute = TAB_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div
      className={cn("pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4", className)}
      style={{
        bottom: onTabRoute ? tabBarInset(12) : "calc(12px + env(safe-area-inset-bottom, 0px))",
      }}
      role="region"
      aria-label={t("pwa.installTitle")}
    >
      <div className="pointer-events-auto w-full max-w-[448px] rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <img
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
            height={48}
            src={APP_ICON}
            width={48}
          />
          <div className="min-w-0 flex-1">
            <p className="font-poppins-semibold text-sm text-slate-900">
              {t("pwa.installTitle")}
            </p>
            <p className="mt-1 font-poppins text-xs leading-5 text-slate-600">
              {iosHint ? t("pwa.installIosHint") : t("pwa.installAndroidHint")}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!iosHint ? (
            <button
              type="button"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-4 font-poppins-semibold text-sm text-white transition-opacity disabled:opacity-50"
              disabled={!canInstall}
              style={{ backgroundColor: theme.tabActive }}
              onClick={() => void install()}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("pwa.installAction")}
            </button>
          ) : null}
          <button
            type="button"
            className={cn(
              "min-h-[44px] rounded-full border border-slate-200 px-4 font-poppins-semibold text-sm text-slate-700",
              iosHint ? "flex-1" : "flex-1",
            )}
            onClick={dismiss}
          >
            {t("pwa.installDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
