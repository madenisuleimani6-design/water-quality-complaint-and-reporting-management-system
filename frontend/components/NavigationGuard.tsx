import { router, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AuthPhase } from "../constants/config";
import { theme } from "../constants/theme";
import { useProfile } from "../hooks/useProfile";

function authHomeRoute(phase: AuthPhase): string {
  switch (phase) {
    case "otp_pending":
      return "/(auth)/otp";
    case "onboarding":
      return "/(auth)/onboarding";
    case "unauthenticated":
    default:
      return "/(auth)/welcome";
  }
}

function isAllowedAuthRoute(
  segment: string | undefined,
  phase: AuthPhase,
): boolean {
  if (phase === "otp_pending") {
    return segment === "otp";
  }
  if (phase === "onboarding") {
    return segment === "onboarding";
  }
  return segment === "welcome" || segment === "phone";
}

export function NavigationGuard({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { ready, isAuthenticated, authPhase } = useProfile();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === "(auth)";
    const authSegment = segments.at(1);
    const inReport = segments[0] === "report";
    const inComplaint = segments[0] === "complaint";

    if (isAuthenticated) {
      if (inAuthGroup) {
        router.replace("/(tabs)");
      }
      return;
    }

    if (inReport || inComplaint || !inAuthGroup) {
      router.replace(authHomeRoute(authPhase));
      return;
    }

    if (!isAllowedAuthRoute(authSegment, authPhase)) {
      router.replace(authHomeRoute(authPhase));
    }
  }, [ready, isAuthenticated, authPhase, segments, router]);

  if (!ready) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.surface }}
      >
        <ActivityIndicator color={theme.tabActive} size="large" />
        <Text className="mt-3 font-poppins text-slate-500">{t("home.loading")}</Text>
      </View>
    );
  }

  return <>{children}</>;
}
