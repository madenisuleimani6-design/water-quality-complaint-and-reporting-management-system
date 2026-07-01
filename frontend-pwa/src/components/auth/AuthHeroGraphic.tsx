import {
  BadgeCheck,
  Droplets,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

import { gradientColors, theme } from "@/constants/theme";
import { AuthHeroCanvas } from "./AuthHeroCanvas";

function FloatingBubble({
  size,
  top,
  left,
  right,
  delay,
  opacity = 0.35,
}: {
  size: number;
  top: number;
  left?: number;
  right?: number;
  delay: number;
  opacity?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      style={{
        position: "absolute",
        top,
        ...(left != null ? { left } : {}),
        ...(right != null ? { right } : {}),
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.ctaPrimary,
      }}
    />
  );
}

export function AuthHeroGraphic() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeroCanvas height={208}>
        <FloatingBubble delay={0.2} left={20} size={14} top={28} />
        <FloatingBubble delay={0.4} right={28} opacity={0.25} size={20} top={16} />
        <FloatingBubble delay={0.6} right={18} opacity={0.2} size={10} top={120} />
        <FloatingBubble delay={0.3} left={44} opacity={0.22} size={12} top={140} />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-[148px] w-[148px] items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
              boxShadow: theme.shadow.fab,
            }}
          >
            <Droplets className="h-[72px] w-[72px] text-white" strokeWidth={1.5} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white"
          style={{ top: 24, right: 20, boxShadow: theme.shadow.card }}
        >
          <BadgeCheck className="h-[22px] w-[22px]" style={{ color: theme.status.resolved }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white"
          style={{ bottom: 16, left: 36, boxShadow: theme.shadow.card }}
        >
          <MapPin className="h-[22px] w-[22px]" style={{ color: theme.ctaPrimary }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white"
          style={{ bottom: 40, right: 52, boxShadow: theme.shadow.card }}
        >
          <MessageSquare className="h-[22px] w-[22px]" style={{ color: theme.status.investigating }} />
        </motion.div>
      </AuthHeroCanvas>
    </motion.div>
  );
}
