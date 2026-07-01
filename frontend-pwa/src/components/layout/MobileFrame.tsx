import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { cn } from "@/lib/utils";

type MobileFrameProps = {
  children: ReactNode;
  variant?: "dark" | "light";
  className?: string;
};

export function MobileFrame({
  children,
  variant = "light",
  className,
}: MobileFrameProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center bg-slate-900">
      <div className="hidden w-full items-center bg-slate-900 px-4 py-3 md:flex">
        <p className="mx-auto max-w-md text-center font-poppins text-sm text-slate-300">
          {t("pwa.desktopNotice")}
        </p>
      </div>
      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-[480px] flex-1 flex-col shadow-xl",
          variant === "dark" ? "bg-slate-900" : "bg-dawasa-surface",
          className,
        )}
      >
        {children}
      </div>
      <InstallPrompt />
    </div>
  );
}
