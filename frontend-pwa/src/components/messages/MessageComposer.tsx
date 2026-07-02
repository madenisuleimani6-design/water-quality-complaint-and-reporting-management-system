import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "@/components/layout/AlertBanner";
import { theme } from "@/constants/theme";

type MessageComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  profileComplete: boolean;
  error?: string | null;
};

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  sending,
  profileComplete,
  error,
}: MessageComposerProps) {
  const { t } = useTranslation();
  const canSend = profileComplete && value.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!canSend) return;
    onSend();
  };

  return (
    <div
      className="border-t border-slate-200 bg-white px-4 pb-3 pt-3"
      style={{ boxShadow: theme.shadow.composer }}
    >
      {!profileComplete ? (
        <AlertBanner
          dashed
          message={t("messages.profileRequired")}
          variant="warning"
        />
      ) : null}
      {error === "send_failed" ? (
        <AlertBanner message={t("messages.sendError")} variant="error" />
      ) : null}
      <div className="flex items-end gap-2">
        <textarea
          aria-label={t("messages.placeholder")}
          disabled={!profileComplete || sending}
          rows={2}
          className="max-h-[120px] min-h-[52px] flex-1 resize-none rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 font-poppins text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-dawasa-cta focus:ring-2 focus:ring-dawasa-cta/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          placeholder={t("messages.placeholder")}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
        />
        <motion.button
          type="button"
          aria-label={t("messages.send")}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.92 } : undefined}
          onClick={handleSend}
          className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: canSend ? theme.ctaPrimary : theme.border,
          }}
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Send
              className="h-[22px] w-[22px]"
              style={{ color: canSend ? theme.textOnPrimary : theme.placeholder }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
