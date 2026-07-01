import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthPhase, STORAGE_KEYS } from "../constants/config";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(tokens));
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.authTokens);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);
}

export async function saveAuthPhase(phase: AuthPhase): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.authPhase, phase);
}

export async function loadAuthPhase(): Promise<AuthPhase> {
  const phase = await AsyncStorage.getItem(STORAGE_KEYS.authPhase);
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
  await AsyncStorage.setItem(STORAGE_KEYS.pendingPhone, phone);
}

export async function loadPendingPhone(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.pendingPhone);
}

export async function saveOtpSessionId(sessionId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.otpSessionId, sessionId);
}

export async function loadOtpSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.otpSessionId);
}

export async function clearAuthFlowState(): Promise<void> {
  await Promise.all([
    clearTokens(),
    AsyncStorage.removeItem(STORAGE_KEYS.authPhase),
    AsyncStorage.removeItem(STORAGE_KEYS.pendingPhone),
    AsyncStorage.removeItem(STORAGE_KEYS.otpSessionId),
  ]);
}
