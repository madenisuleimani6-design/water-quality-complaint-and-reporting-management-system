import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { TAB_BAR_CONTENT_HEIGHT } from "@/constants/layout";
import { theme } from "@/constants/theme";

type FloatingActionButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function FloatingActionButton({
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const bottom = TAB_BAR_CONTENT_HEIGHT + 16;

  return (
    <motion.button
      type="button"
      aria-label={accessibilityLabel}
      onClick={onPress}
      whileTap={{ scale: 0.92 }}
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full"
      style={{
        backgroundColor: theme.ctaPrimary,
        boxShadow: theme.shadow.fab,
        bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
        right: "max(1rem, calc((100vw - 480px) / 2 + 1rem))",
      }}
    >
      <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
    </motion.button>
  );
}
