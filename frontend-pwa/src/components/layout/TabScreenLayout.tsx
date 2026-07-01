import type { ReactNode } from "react";

import { GradientHeader } from "@/components/layout/GradientHeader";
import {
  CONTENT_SHEET_TOP_PADDING,
  TAB_HEADER_CONTENT_HEIGHT,
} from "@/constants/layout";
import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type TabScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  scrollClassName?: string;
};

export function TabScreenLayout({
  title,
  subtitle,
  children,
  footer,
  contentClassName,
  scrollClassName,
}: TabScreenLayoutProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden"
      style={{ backgroundColor: theme.surface }}
    >
      <GradientHeader pinned subtitle={subtitle} title={title} />
      <div
        className={cn("flex min-h-0 flex-1 flex-col", contentClassName)}
        style={{
          paddingTop: `calc(${TAB_HEADER_CONTENT_HEIGHT}px + env(safe-area-inset-top, 0px))`,
        }}
      >
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4",
            scrollClassName,
          )}
          style={{ paddingTop: CONTENT_SHEET_TOP_PADDING }}
        >
          {children}
        </div>
        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
}
