import {
  CITIZENS_ME_ENDPOINT,
  CITIZENS_OTP_SEND_ENDPOINT,
  CITIZENS_OTP_VERIFY_ENDPOINT,
  CITIZENS_REGISTER_ENDPOINT,
  CITIZENS_TOKEN_REFRESH_ENDPOINT,
} from "../constants/config";
import { CitizenProfile } from "../types/citizen";
import { roundCoordinate } from "../utils/coordinates";
import { AuthTokens, saveTokens } from "../utils/authStorage";
import { api } from "./api";
import { CitizenAccountResponse, toProfile } from "./citizens";

export type OtpSendResponse = {
  sessionId: string;
  expiresIn: number;
  phone: string;
  devCode?: string;
};

export type OtpVerifyExistingResponse = {
  status: "existing";
  account: CitizenAccountResponse;
  access: string;
  refresh: string;
};

export type OtpVerifyNewResponse = {
  status: "new";
  phone: string;
  access: string;
  refresh: string;
};

export type OtpVerifyResponse =
  | OtpVerifyExistingResponse
  | OtpVerifyNewResponse;

export type RegisterResponse = {
  account: CitizenAccountResponse;
  access: string;
  refresh: string;
};

export async function sendOtp(phone: string): Promise<OtpSendResponse> {
  const { data } = await api.post<OtpSendResponse>(CITIZENS_OTP_SEND_ENDPOINT, {
    phone,
  });
  return data;
}

export async function verifyOtp(input: {
  phone: string;
  sessionId: string;
  code: string;
}): Promise<OtpVerifyResponse> {
  const { data } = await api.post<OtpVerifyResponse>(
    CITIZENS_OTP_VERIFY_ENDPOINT,
    {
      phone: input.phone,
      sessionId: input.sessionId,
      code: input.code,
    },
  );
  return data;
}

export async function registerCitizenAfterOtp(input: {
  fullName: string;
  area?: string;
  latitude?: number | null;
  longitude?: number | null;
  preferredLanguage: CitizenProfile["preferredLanguage"];
}): Promise<{ profile: CitizenProfile; tokens: AuthTokens }> {
  const { data } = await api.post<RegisterResponse>(CITIZENS_REGISTER_ENDPOINT, {
    fullName: input.fullName,
    area: input.area?.trim().slice(0, 255),
    latitude: roundCoordinate(input.latitude),
    longitude: roundCoordinate(input.longitude),
  });
  const tokens = { access: data.access, refresh: data.refresh };
  await saveTokens(tokens);
  return {
    profile: toProfile(data.account, input.preferredLanguage),
    tokens,
  };
}

export async function fetchCitizenMe(
  language: CitizenProfile["preferredLanguage"],
): Promise<CitizenProfile> {
  const { data } = await api.get<CitizenAccountResponse>(CITIZENS_ME_ENDPOINT);
  return toProfile(data, language);
}

export async function refreshCitizenToken(
  refresh: string,
): Promise<AuthTokens> {
  const { data } = await api.post<{ access: string; refresh?: string }>(
    CITIZENS_TOKEN_REFRESH_ENDPOINT,
    { refresh },
  );
  const tokens = {
    access: data.access,
    refresh: data.refresh ?? refresh,
  };
  await saveTokens(tokens);
  return tokens;
}

export async function persistVerifiedSession(
  response: OtpVerifyExistingResponse,
  language: CitizenProfile["preferredLanguage"],
): Promise<CitizenProfile> {
  const tokens = { access: response.access, refresh: response.refresh };
  await saveTokens(tokens);
  return toProfile(response.account, language);
}

export async function persistRegistrationSession(
  response: OtpVerifyNewResponse,
): Promise<AuthTokens> {
  const tokens = { access: response.access, refresh: response.refresh };
  await saveTokens(tokens);
  return tokens;
}
