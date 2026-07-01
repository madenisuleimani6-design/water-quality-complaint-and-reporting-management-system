import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

import { gradientColors, theme } from "@/constants/theme";

type HomeStatsBarProps = {
  totalReports: number;
};

export function HomeStatsBar({ totalReports }: HomeStatsBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="mb-4 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        boxShadow: theme.shadow.card,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
        >
          <ClipboardList className="h-[22px] w-[22px] text-white" />
        </div>
        <div className="flex-1">
          <p className="font-poppins-semibold text-base text-white">
            {t(
              totalReports === 1 ? "home.statsTitleOne" : "home.statsTitleMany",
              { count: totalReports },
            )}
          </p>
          <p
            className="mt-0.5 font-poppins text-xs leading-5"
            style={{ color: theme.textMutedOnPrimary }}
          >
            {t("home.statsHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
