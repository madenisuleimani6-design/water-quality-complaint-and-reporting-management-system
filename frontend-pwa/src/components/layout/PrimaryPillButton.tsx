import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "dashed"
  | "dark"
  | "light"
  | "danger";

type PrimaryPillButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  fullWidth?: boolean;
};

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: theme.ctaSecondary,
        color: theme.ctaPrimary,
        border: `1.5px solid ${theme.ctaPrimary}`,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        color: theme.textMuted,
        border: `1.5px solid ${theme.border}`,
      };
    case "dashed":
      return {
        backgroundColor: theme.card,
        color: theme.textMuted,
        border: `1.5px dashed ${theme.border}`,
      };
    case "dark":
      return {
        backgroundColor: theme.ctaDark,
        color: theme.textOnPrimary,
        border: "none",
      };
    case "light":
      return {
        backgroundColor: theme.ctaSecondary,
        color: theme.ctaDark,
        border: "none",
      };
    case "danger":
      return {
        backgroundColor: theme.feedback.error.text,
        color: theme.textOnPrimary,
        border: "none",
      };
    case "primary":
    default:
      return {
        backgroundColor: theme.ctaPrimary,
        color: theme.textOnPrimary,
        border: "none",
      };
  }
}

export function PrimaryPillButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
  fullWidth = false,
}: PrimaryPillButtonProps) {
  const styles = getVariantStyles(variant);

  return (
    <motion.button
      type="button"
      disabled={disabled || loading}
      onClick={onPress}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(
        "flex min-h-[52px] items-center justify-center rounded-full px-6 font-poppins-semibold text-base transition-opacity",
        (disabled || loading) && "opacity-60",
        fullWidth && "w-full",
        className,
      )}
      style={styles}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: styles.color }} />
      ) : (
        label
      )}
    </motion.button>
  );
}
