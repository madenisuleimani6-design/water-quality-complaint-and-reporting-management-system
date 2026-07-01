import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "../constants/config";
import { CitizenProfile } from "../types/citizen";

export const defaultProfile: CitizenProfile = {
  phone: "",
  preferredLanguage: "en",
};

const DEFAULT_PROFILE = defaultProfile;

export async function loadProfile(): Promise<CitizenProfile> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return DEFAULT_PROFILE;
  }
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) } as CitizenProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: CitizenProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function isProfileComplete(profile: CitizenProfile): boolean {
  return (
    profile.phone.trim().length > 0 &&
    (profile.fullName?.trim().length ?? 0) > 0
  );
}
