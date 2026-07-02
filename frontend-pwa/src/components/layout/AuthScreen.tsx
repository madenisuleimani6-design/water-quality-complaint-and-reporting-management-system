import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type AuthScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hero?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
  centerContent?: boolean;
  centerHeader?: boolean;
  headerExtra?: ReactNode;
};

export function AuthScreen({
  children,
  title,
  subtitle,
  hero,
  showBack = false,
  onBack,
  footer,
  centerContent = false,
  centerHeader = false,
  headerExtra,
}: AuthScreenProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: theme.surface }}>
      {showBack ? (
        <div className="px-5 pt-safe">
          <button
            type="button"
            aria-label="Back"
            onClick={handleBack}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: theme.shadow.cardSubtle }}
          >
            <ArrowLeft className="h-5 w-5 text-slate-900" />
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "flex-1 overflow-y-auto px-5 pb-4",
          centerContent && "flex flex-col justify-center",
        )}
      >
        {hero}
        {headerExtra ? (
          <div className={centerHeader ? "text-center" : ""}>{headerExtra}</div>
        ) : null}
        {title ? (
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hero ? 0.08 : 0 }}
            className={cn(
              "font-poppins-bold text-[28px] leading-9 tracking-tight text-slate-900",
              centerHeader && "text-center",
            )}
          >
            {title}
          </motion.h1>
        ) : null}
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hero ? 0.12 : 0.04 }}
            className={cn(
              "mt-2 font-poppins text-base leading-6 text-slate-500",
              centerHeader && "text-center",
            )}
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hero ? 0.16 : 0.08 }}
          className={cn("flex flex-col gap-4", (title || subtitle) && "mt-8")}
        >
          {children}
        </motion.div>
      </div>

      {footer ? (
        <div
          className="px-5 pt-3 pb-safe"
          style={{ backgroundColor: theme.surface }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
