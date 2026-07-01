import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type GradientHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  pinned?: boolean;
};

export function HeaderBackButton({
  onPress,
  accessibilityLabel = "Back",
}: {
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={accessibilityLabel}
      onClick={onPress}
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: theme.feedback.info.bg }}
    >
      <ArrowLeft className="h-5 w-5 text-slate-900" />
    </button>
  );
}

export function GradientHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  pinned = false,
}: GradientHeaderProps) {
  const hasSideActions = Boolean(leftAction || rightAction);
  const contentPadding = subtitle ? "px-5 pb-7 pt-5" : "px-5 pb-5 pt-5";

  return (
    <header
      className={cn(
        "border-b border-dawasa-border bg-white pt-safe",
        pinned &&
          "fixed top-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 shadow-sm",
      )}
      style={{ borderBottomColor: theme.border }}
    >
      <div className={contentPadding}>
        {hasSideActions ? (
          <div className="flex items-center gap-3">
            {leftAction ?? <div className="w-10" />}
            <div className="min-h-10 flex-1 justify-center">
              <h1 className="font-poppins-bold text-xl leading-7 text-slate-900 line-clamp-2">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-0.5 font-poppins text-sm leading-5 text-slate-500 line-clamp-2">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {rightAction ?? <div className="w-10" />}
          </div>
        ) : (
          <div>
            <h1 className="font-poppins-bold text-2xl leading-8 text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 font-poppins text-sm leading-5 text-slate-500 line-clamp-2">
                {subtitle}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
