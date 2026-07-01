import { AppLanguage } from "../constants/config";

export type CitizenProfile = {
  citizenId?: string;
  fullName?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  area?: string;
  latitude?: number | null;
  longitude?: number | null;
  preferredLanguage: AppLanguage;
};

export type ComplaintSummary = {
  id: string;
  status: string;
  areaName: string;
  submittedAt: string;
  note?: string;
  photoUrl?: string | null;
};

export type ComplaintDetail = ComplaintSummary & {
  latitude?: number | null;
  longitude?: number | null;
};

export type MessageProfileSnapshot = {
  phone: string;
  fullName?: string;
  email?: string;
  area?: string;
};

export type CitizenMessage = {
  id: string;
  body: string;
  sentAt: string;
  profileSnapshot?: MessageProfileSnapshot;
  status: "pending" | "sent" | "failed";
  adminReply?: string | null;
  adminRepliedAt?: string | null;
};
