import { Home, MessageSquare, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TAB_BAR_CONTENT_HEIGHT } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", icon: Home, labelKey: "tabs.home" as const },
  { to: "/messages", icon: MessageSquare, labelKey: "tabs.messages" as const },
  { to: "/profile", icon: User, labelKey: "tabs.profile" as const },
];

export function TabBar() {
  const { t } = useTranslation();

  return (
    <nav
      className="z-40 w-full shrink-0 border-t border-slate-200 bg-white pb-safe"
    >
      <div
        className="flex items-center justify-around px-2"
        style={{ minHeight: TAB_BAR_CONTENT_HEIGHT }}
      >
        {tabs.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1",
                isActive ? "text-dawasa-blue" : "text-slate-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? theme.tabActive : theme.tabInactive}
                />
                <span
                  className={cn(
                    "font-poppins text-[11px]",
                    isActive ? "font-poppins-semibold" : "",
                  )}
                >
                  {t(labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
