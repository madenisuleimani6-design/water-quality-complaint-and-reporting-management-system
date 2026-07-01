import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PrimaryPillButton } from "@/components/layout/PrimaryPillButton";
import { theme } from "@/constants/theme";

type EmptyHomeStateProps = {
  onReportPress: () => void;
  missingPhone?: boolean;
};

export function EmptyHomeState({ onReportPress, missingPhone }: EmptyHomeStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center pb-12"
    >
      <div
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.feedback.info.bg }}
      >
        <Droplets className="h-12 w-12" style={{ color: theme.ctaPrimary }} />
      </div>
      <h2 className="text-center font-poppins-bold text-xl text-slate-900">
        {t("home.emptyTitle")}
      </h2>
      <p className="mt-2 max-w-xs text-center font-poppins text-sm text-slate-500">
        {missingPhone ? t("home.emptyPhoneHint") : t("home.emptyHint")}
      </p>
      <div className="mt-6 w-full">
        <PrimaryPillButton
          fullWidth
          label={t("home.reportIssue")}
          onPress={onReportPress}
        />
      </div>
    </motion.div>
  );
}
