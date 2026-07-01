import { STORAGE_KEYS } from "@/constants/config";
import { storage } from "@/lib/storage";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await storage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(tokens));
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const raw = await storage.getItem(STORAGE_KEYS.authTokens);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await storage.removeItem(STORAGE_KEYS.authTokens);
}

export async function saveAuthPhase(
  phase: import("@/constants/config").AuthPhase,
): Promise<void> {
  await storage.setItem(STORAGE_KEYS.authPhase, phase);
}

export async function loadAuthPhase(): Promise<
  import("@/constants/config").AuthPhase
> {
  const phase = await storage.getItem(STORAGE_KEYS.authPhase);
  if (
    phase === "otp_pending" ||
    phase === "onboarding" ||
    phase === "authenticated"
  ) {
    return phase;
  }
  return "unauthenticated";
}

export async function savePendingPhone(phone: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.pendingPhone, phone);
}

export async function loadPendingPhone(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.pendingPhone);
}

export async function saveOtpSessionId(sessionId: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.otpSessionId, sessionId);
}

export async function loadOtpSessionId(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.otpSessionId);
}

export async function clearAuthFlowState(): Promise<void> {
  await storage.multiRemove([
    STORAGE_KEYS.authTokens,
    STORAGE_KEYS.authPhase,
    STORAGE_KEYS.pendingPhone,
    STORAGE_KEYS.otpSessionId,
  ]);
}
