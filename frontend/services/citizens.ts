import { CITIZENS_ME_ENDPOINT } from "../constants/config";
import { CitizenProfile } from "../types/citizen";
import { roundCoordinate } from "../utils/coordinates";
import { api } from "./api";
export type CitizenAccountResponse = {
  id: string;
  phone: string;
  fullName: string;
  secondaryPhone?: string;
  email?: string;
  area?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export type CitizenLocationFields = {
  area?: string;
  latitude?: number | null;
  longitude?: number | null;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toProfile(
  account: CitizenAccountResponse,
  language: CitizenProfile["preferredLanguage"],
): CitizenProfile {
  return {
    citizenId: account.id,
    phone: account.phone,
    fullName: account.fullName,
    secondaryPhone: account.secondaryPhone || undefined,
    email: account.email || undefined,
    area: account.area || undefined,
    latitude: toNumber(account.latitude),
    longitude: toNumber(account.longitude),
    preferredLanguage: language,
  };
}

function locationPayload(
  location: CitizenLocationFields,
): Record<string, string | number | undefined> {
  const payload: Record<string, string | number | undefined> = {};
  if (location.area !== undefined) {
    payload.area = location.area;
  }
  if (location.latitude !== undefined && location.latitude !== null) {
    payload.latitude = roundCoordinate(location.latitude) ?? undefined;
  }
  if (location.longitude !== undefined && location.longitude !== null) {
    payload.longitude = roundCoordinate(location.longitude) ?? undefined;
  }
  return payload;
}

export async function updateCitizenProfile(input: {
  profile: CitizenProfile;
  location?: CitizenLocationFields;
}): Promise<CitizenProfile> {
  const { profile, location } = input;
  const payload: Record<string, string | number | undefined> = {
    fullName: profile.fullName,
    secondaryPhone: profile.secondaryPhone,
    email: profile.email,
    area: profile.area,
    ...locationPayload(location ?? profile),
  };

  const { data } = await api.patch<CitizenAccountResponse>(
    CITIZENS_ME_ENDPOINT,
    payload,
  );
  return toProfile(data, profile.preferredLanguage);
}
