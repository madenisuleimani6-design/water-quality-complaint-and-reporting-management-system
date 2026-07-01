import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants/theme";

export function EmptyMessagesState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center px-4 py-16"
    >
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.feedback.info.bg }}
      >
        <MessageSquare className="h-10 w-10" style={{ color: theme.ctaPrimary }} />
      </div>
      <h2 className="text-center font-poppins-bold text-xl text-slate-900">
        {t("messages.emptyTitle")}
      </h2>
      <p className="mt-2 max-w-xs text-center font-poppins text-sm text-slate-500">
        {t("messages.emptyHint")}
      </p>
    </motion.div>
  );
}
