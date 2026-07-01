import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertBannerProps = {
  variant: AlertVariant;
  message: string;
  children?: ReactNode;
  dashed?: boolean;
};

const icons: Record<AlertVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function AlertBanner({
  variant,
  message,
  children,
  dashed = false,
}: AlertBannerProps) {
  const colors = theme.feedback[variant];
  const Icon = icons[variant];

  return (
    <div
      className={cn("mb-3 rounded-2xl border px-4 py-3", dashed && "border-dashed")}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: colors.text }} />
        <p className="flex-1 font-poppins text-sm leading-5" style={{ color: colors.text }}>
          {message}
        </p>
      </div>
      {children}
    </div>
  );
}
