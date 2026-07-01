export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const COMPLAINTS_ENDPOINT = "/api/complaints/";
export const MESSAGES_ENDPOINT = "/api/messages/";
export const CITIZENS_OTP_SEND_ENDPOINT = "/api/citizens/otp/send/";
export const CITIZENS_OTP_VERIFY_ENDPOINT = "/api/citizens/otp/verify/";
export const CITIZENS_TOKEN_REFRESH_ENDPOINT = "/api/citizens/token/refresh/";
export const CITIZENS_REGISTER_ENDPOINT = "/api/citizens/register/";
export const CITIZENS_LOGIN_ENDPOINT = "/api/citizens/login/";
export const CITIZENS_ME_ENDPOINT = "/api/citizens/me/";

export const MAX_QUEUE_SIZE = 10;

export const STORAGE_KEYS = {
  language: "@dawasa/language",
  offlineQueue: "@dawasa/offline-queue",
  profile: "@dawasa/profile",
  messagesOutbox: "@dawasa/messages-outbox",
  authTokens: "@dawasa/auth-tokens",
  authPhase: "@dawasa/auth-phase",
  pendingPhone: "@dawasa/pending-phone",
  otpSessionId: "@dawasa/otp-session-id",
} as const;

export type AuthPhase =
  | "unauthenticated"
  | "otp_pending"
  | "onboarding"
  | "authenticated";

export const SUPPORTED_LANGUAGES = ["en", "sw"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function getWebSocketUrl(complaintId: string): string {
  const base = API_URL.replace(/^http/, "ws").replace(/\/$/, "");
  return `${base}/ws/complaints/${complaintId}/`;
}

/** Resolve relative media paths from the API (e.g. /media/...). */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = API_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
