import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isAxiosError } from "axios";

import type { AppLanguage, AuthPhase } from "@/constants/config";
import { setAppLanguage } from "@/i18n";
import { fetchCurrentLocation } from "@/lib/geolocation";
import {
  persistRegistrationSession,
  persistVerifiedSession,
  registerCitizenAfterOtp,
  fetchCitizenMe,
  sendOtp as sendOtpRequest,
  verifyOtp as verifyOtpRequest,
} from "@/services/auth";
import { updateCitizenProfile } from "@/services/citizens";
import type { CitizenProfile } from "@/types/citizen";
import {
  clearAuthFlowState,
  loadAuthPhase,
  loadOtpSessionId,
  loadPendingPhone,
  loadTokens,
  saveAuthPhase,
  saveOtpSessionId,
  savePendingPhone,
} from "@/utils/authStorage";
import {
  defaultProfile,
  isProfileComplete,
  loadProfile,
  saveProfile,
} from "@/utils/profileStorage";
import { isValidTzPhone, normalizeTzPhone } from "@/utils/phoneValidation";

export type { AuthPhase };

type ProfileContextValue = {
  profile: CitizenProfile;
  ready: boolean;
  saving: boolean;
  errors: Record<string, string>;
  authError: string | null;
  authPhase: AuthPhase;
  pendingPhone: string;
  otpSessionId: string;
  otpDevCode: string | null;
  isComplete: boolean;
  isAuthenticated: boolean;
  updateField: <K extends keyof CitizenProfile>(
    key: K,
    value: CitizenProfile[K],
  ) => void;
  save: (overrides?: Partial<CitizenProfile>) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<"existing" | "onboarding" | false>;
  completeOnboarding: (input: {
    fullName: string;
    preferredLanguage: AppLanguage;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  clearAuthError: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function validateDraft(draft: CitizenProfile): Record<string, string> {
  const nextErrors: Record<string, string> = {};
  if (!draft.fullName?.trim()) nextErrors.fullName = "required";
  if (!draft.phone.trim()) nextErrors.phone = "required";
  else if (!isValidTzPhone(draft.phone)) nextErrors.phone = "invalid";
  if (draft.secondaryPhone?.trim() && !isValidTzPhone(draft.secondaryPhone)) {
    nextErrors.secondaryPhone = "invalid";
  }
  if (draft.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
    nextErrors.email = "invalid";
  }
  return nextErrors;
}

function normalizeDraft(draft: CitizenProfile): CitizenProfile {
  return {
    ...draft,
    fullName: draft.fullName?.trim(),
    phone: draft.phone ? normalizeTzPhone(draft.phone) : "",
    secondaryPhone: draft.secondaryPhone
      ? normalizeTzPhone(draft.secondaryPhone)
      : undefined,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CitizenProfile>(defaultProfile);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>("unauthenticated");
  const [pendingPhone, setPendingPhone] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [otpDevCode, setOtpDevCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [stored, phase, phone, sessionId, tokens] = await Promise.all([
        loadProfile(),
        loadAuthPhase(),
        loadPendingPhone(),
        loadOtpSessionId(),
        loadTokens(),
      ]);

      if (stored.preferredLanguage) {
        await setAppLanguage(stored.preferredLanguage);
      }

      if (cancelled) return;

      setPendingPhone(phone ?? "");
      setOtpSessionId(sessionId ?? "");

      if (tokens?.access && phase === "authenticated") {
        try {
          const me = await fetchCitizenMe(stored.preferredLanguage);
          const merged = { ...stored, ...me };
          await saveProfile(merged);
          setProfile(merged);
          setAuthPhase("authenticated");
          await saveAuthPhase("authenticated");
        } catch {
          await clearAuthFlowState();
          await saveProfile(defaultProfile);
          setProfile(defaultProfile);
          setAuthPhase("unauthenticated");
        }
      } else if (phase === "onboarding" && tokens?.access) {
        setProfile({ ...stored, phone: phone ?? stored.phone });
        setAuthPhase("onboarding");
      } else if (phase === "otp_pending" && phone && sessionId) {
        setAuthPhase("otp_pending");
      } else {
        setProfile(stored.phone ? stored : defaultProfile);
        setAuthPhase("unauthenticated");
      }

      setReady(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof CitizenProfile>(key: K, value: CitizenProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
      setAuthError(null);
    },
    [],
  );

  const persistProfile = useCallback(async (draft: CitizenProfile) => {
    await saveProfile(draft);
    await setAppLanguage(draft.preferredLanguage);
    setProfile(draft);
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const normalized = normalizeTzPhone(phone);
    if (!isValidTzPhone(normalized)) {
      setErrors({ phone: "invalid" });
      return false;
    }

    setSaving(true);
    setAuthError(null);
    setErrors({});
    try {
      const result = await sendOtpRequest(normalized);
      setPendingPhone(result.phone);
      setOtpSessionId(result.sessionId);
      setOtpDevCode(result.devCode ?? null);
      await savePendingPhone(result.phone);
      await saveOtpSessionId(result.sessionId);
      await saveAuthPhase("otp_pending");
      setAuthPhase("otp_pending");
      return true;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 429) {
        setAuthError("otp_cooldown");
      } else {
        setAuthError("otp_send_failed");
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string): Promise<"existing" | "onboarding" | false> => {
      if (!pendingPhone || !otpSessionId) {
        setAuthError("otp_session_missing");
        return false;
      }

      setSaving(true);
      setAuthError(null);
      try {
        const result = await verifyOtpRequest({
          phone: pendingPhone,
          sessionId: otpSessionId,
          code,
        });

        if (result.status === "existing") {
          const account = await persistVerifiedSession(
            result,
            profile.preferredLanguage,
          );
          await persistProfile(account);
          await saveAuthPhase("authenticated");
          setAuthPhase("authenticated");
          setOtpDevCode(null);
          return "existing";
        }

        await persistRegistrationSession(result);
        setProfile((prev) => ({ ...prev, phone: result.phone }));
        await saveAuthPhase("onboarding");
        setAuthPhase("onboarding");
        setOtpDevCode(null);
        return "onboarding";
      } catch (error) {
        if (isAxiosError(error)) {
          const codeKey = (error.response?.data as { code?: string })?.code;
          if (codeKey === "expired" || codeKey === "invalid_session") {
            setAuthError("otp_expired");
          } else if (codeKey === "invalid_code") {
            setAuthError("otp_invalid");
          } else if (codeKey === "too_many_attempts") {
            setAuthError("otp_too_many_attempts");
          } else {
            setAuthError("otp_verify_failed");
          }
        } else {
          setAuthError("otp_verify_failed");
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [otpSessionId, pendingPhone, persistProfile, profile.preferredLanguage],
  );

  const completeOnboarding = useCallback(
    async (input: { fullName: string; preferredLanguage: AppLanguage }) => {
      const draft = normalizeDraft({
        ...profile,
        fullName: input.fullName,
        preferredLanguage: input.preferredLanguage,
        phone: pendingPhone || profile.phone,
      });
      const nextErrors = validateDraft(draft);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return false;

      setSaving(true);
      setAuthError(null);
      try {
        const location = await fetchCurrentLocation();
        const { profile: account } = await registerCitizenAfterOtp({
          fullName: draft.fullName!,
          area: location.areaName ?? draft.area,
          latitude: location.latitude,
          longitude: location.longitude,
          preferredLanguage: draft.preferredLanguage,
        });
        await persistProfile({ ...draft, ...account });
        await saveAuthPhase("authenticated");
        setAuthPhase("authenticated");
        return true;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setAuthError("phone_already_registered");
        } else {
          setAuthError("register_failed");
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [pendingPhone, persistProfile, profile],
  );

  const logout = useCallback(async () => {
    await clearAuthFlowState();
    await saveProfile(defaultProfile);
    setProfile(defaultProfile);
    setPendingPhone("");
    setOtpSessionId("");
    setOtpDevCode(null);
    setAuthPhase("unauthenticated");
    setErrors({});
    setAuthError(null);
  }, []);

  const save = useCallback(
    async (overrides?: Partial<CitizenProfile>) => {
      const draft = normalizeDraft({ ...profile, ...overrides });
      const nextErrors = validateDraft(draft);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return false;

      setSaving(true);
      setAuthError(null);
      try {
        const location = await fetchCurrentLocation();
        const updated = await updateCitizenProfile({
          profile: draft,
          location: {
            area: draft.area || location.areaName || undefined,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
        await persistProfile({ ...draft, ...updated });
        return true;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setAuthError("phone_already_registered");
        } else {
          setAuthError("profile_update_failed");
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [persistProfile, profile],
  );

  const setLanguage = useCallback(
    async (language: AppLanguage) => {
      updateField("preferredLanguage", language);
      await setAppLanguage(language);
      const stored = await loadProfile();
      if (isProfileComplete(stored)) {
        await saveProfile({ ...stored, preferredLanguage: language });
      }
    },
    [updateField],
  );

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      saving,
      errors,
      authError,
      authPhase,
      pendingPhone,
      otpSessionId,
      otpDevCode,
      isComplete: isProfileComplete(profile),
      isAuthenticated:
        authPhase === "authenticated" && isProfileComplete(profile),
      updateField,
      save,
      sendOtp,
      verifyOtp,
      completeOnboarding,
      logout,
      setLanguage,
      clearAuthError,
    }),
    [
      profile,
      ready,
      saving,
      errors,
      authError,
      authPhase,
      pendingPhone,
      otpSessionId,
      otpDevCode,
      updateField,
      save,
      sendOtp,
      verifyOtp,
      completeOnboarding,
      logout,
      setLanguage,
      clearAuthError,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within ProfileProvider");
  }
  return context;
}
