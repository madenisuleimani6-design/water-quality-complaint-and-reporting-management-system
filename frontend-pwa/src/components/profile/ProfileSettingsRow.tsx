import { ChevronRight, type LucideIcon } from "lucide-react";

import { theme } from "@/constants/theme";

type ProfileSettingsRowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  leftIcon?: LucideIcon;
  isLast?: boolean;
};

export function ProfileSettingsRow({
  title,
  subtitle,
  onPress,
  leftIcon: Icon,
  isLast = false,
}: ProfileSettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex w-full items-center px-4 py-4 text-left active:bg-slate-50 ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      {Icon ? (
        <div
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.feedback.info.bg }}
        >
          <Icon className="h-5 w-5" style={{ color: theme.ctaPrimary }} />
        </div>
      ) : null}
      <div className="flex-1 pr-3">
        <p className="font-poppins-medium text-base text-slate-900">{title}</p>
        {subtitle ? (
          <p className="mt-1 font-poppins text-xs leading-4 text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      <ChevronRight className="h-[22px] w-[22px]" style={{ color: theme.tabInactive }} />
    </button>
  );
}
