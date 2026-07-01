import type { LucideIcon } from "lucide-react";

import { theme } from "@/constants/theme";

type AuthFeature = {
  icon: LucideIcon;
  label: string;
};

type AuthFeatureListProps = {
  features: AuthFeature[];
};

export function AuthFeatureList({ features }: AuthFeatureListProps) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.label}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ backgroundColor: theme.card, boxShadow: theme.shadow.cardSubtle }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.feedback.info.bg }}
            >
              <Icon className="h-5 w-5" style={{ color: theme.ctaPrimary }} />
            </div>
            <p className="flex-1 font-poppins-medium text-[15px] text-slate-700">
              {feature.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
