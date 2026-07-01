import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle, Edit3, Languages, UserCircle } from "lucide-react";

import { gradientColors, theme } from "@/constants/theme";
import { AuthHeroCanvas } from "./AuthHeroCanvas";

export function AuthOnboardingHero() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeroCanvas height={148}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
              boxShadow: theme.shadow.card,
            }}
          >
            <UserCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="absolute flex h-10 w-10 items-center justify-center rounded-2xl bg-white"
          style={{ top: 16, left: 28, boxShadow: theme.shadow.cardSubtle }}
        >
          <Languages className="h-5 w-5" style={{ color: theme.ctaPrimary }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute flex h-10 w-10 items-center justify-center rounded-2xl bg-white"
          style={{ top: 8, right: 28, boxShadow: theme.shadow.cardSubtle }}
        >
          <CheckCircle className="h-5 w-5" style={{ color: theme.status.resolved }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="absolute flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ bottom: 8, right: 52, backgroundColor: theme.feedback.info.bg }}
        >
          <Edit3 className="h-[18px] w-[18px]" style={{ color: theme.ctaPrimary }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
          className="absolute flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ bottom: 16, left: 52, backgroundColor: theme.feedback.success.bg }}
        >
          <BadgeCheck className="h-[18px] w-[18px]" style={{ color: theme.status.resolved }} />
        </motion.div>
      </AuthHeroCanvas>
    </motion.div>
  );
}
