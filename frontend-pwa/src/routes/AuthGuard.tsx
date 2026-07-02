import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { SplashScreen } from "@/components/layout/SplashScreen";
import type { AuthPhase } from "@/constants/config";
import { useProfile } from "@/hooks/useProfile";

function authHomeRoute(phase: AuthPhase): string {
  switch (phase) {
    case "otp_pending":
      return "/otp";
    case "onboarding":
      return "/onboarding";
    case "unauthenticated":
    default:
      return "/welcome";
  }
}

function isAllowedAuthRoute(path: string, phase: AuthPhase): boolean {
  if (phase === "otp_pending") return path === "/otp" || path === "/phone";
  if (phase === "onboarding") return path === "/onboarding";
  return path === "/welcome" || path === "/phone";
}

const AUTH_PATHS = ["/welcome", "/phone", "/otp", "/onboarding"];
const PROTECTED_PREFIXES = ["/home", "/messages", "/profile", "/report", "/complaint"];

function isAuthPath(path: string) {
  return AUTH_PATHS.includes(path);
}

function isProtectedPath(path: string) {
  return PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function AuthGuard() {
  const { ready, isAuthenticated, authPhase } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated) {
      if (isAuthPath(path)) {
        navigate("/home", { replace: true });
      }
      return;
    }

    if (isProtectedPath(path) || path === "/") {
      navigate(authHomeRoute(authPhase), { replace: true });
      return;
    }

    if (isAuthPath(path) && !isAllowedAuthRoute(path, authPhase)) {
      navigate(authHomeRoute(authPhase), { replace: true });
    }
  }, [ready, isAuthenticated, authPhase, path, navigate]);

  if (!ready) {
    return <SplashScreen />;
  }

  if (isAuthenticated && isAuthPath(path)) {
    return <Navigate to="/home" replace />;
  }

  if (!isAuthenticated && (isProtectedPath(path) || path === "/")) {
    return <Navigate to={authHomeRoute(authPhase)} replace />;
  }

  if (!isAuthenticated && isAuthPath(path) && !isAllowedAuthRoute(path, authPhase)) {
    return <Navigate to={authHomeRoute(authPhase)} replace />;
  }

  return <Outlet />;
}
