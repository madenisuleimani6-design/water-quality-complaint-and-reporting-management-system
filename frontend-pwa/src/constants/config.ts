export const API_URL = (() => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  // Dev: relative URLs — Vite proxies /api and /ws to Django (works from phone on LAN too).
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:8000";
})();

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
  if (!API_URL && typeof window !== "undefined") {
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${window.location.host}/ws/complaints/${complaintId}/`;
  }
  const base = API_URL.replace(/^http/, "ws").replace(/\/$/, "");
  return `${base}/ws/complaints/${complaintId}/`;
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
