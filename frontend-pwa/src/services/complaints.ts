import axios from "axios";

import { COMPLAINTS_ENDPOINT, resolveMediaUrl } from "@/constants/config";
import type { ComplaintDetail, ComplaintSummary } from "@/types/citizen";
import { preparePhotoForUpload } from "@/utils/imageCompression";
import { api } from "./api";

export type SubmitComplaintInput = {
  photoUri: string;
  photoFile?: File;
  latitude: number | null;
  longitude: number | null;
  areaName?: string | null;
  note?: string;
  phone?: string;
  reporterName?: string;
};

export type SubmitComplaintResult = {
  id: string;
  status: string;
};

type ComplaintsListResponse = {
  results: ComplaintSummary[];
};

type ComplaintApiRow = ComplaintSummary & { photoUrl?: string | null };

function normalizeComplaint<T extends ComplaintApiRow>(row: T): T {
  return {
    ...row,
    photoUrl: resolveMediaUrl(row.photoUrl),
  };
}

function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "Request timed out. Check your connection and try again.";
      }
      return "Could not reach the server. Check your internet connection.";
    }

    const data = error.response.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === "string" && record.detail.trim()) {
        return record.detail.trim();
      }

      const messages: string[] = [];
      for (const [field, value] of Object.entries(record)) {
        if (field === "detail") continue;
        if (Array.isArray(value)) {
          const text = value.filter((item) => typeof item === "string").join(", ");
          if (text) messages.push(`${field}: ${text}`);
        } else if (typeof value === "string" && value.trim()) {
          messages.push(`${field}: ${value.trim()}`);
        }
      }
      if (messages.length) return messages.join(" • ");
    }
  }

  return "submit failed";
}

export async function listComplaintsByPhone(
  phone: string,
): Promise<ComplaintSummary[]> {
  const { data } = await api.get<ComplaintsListResponse>(COMPLAINTS_ENDPOINT, {
    params: { phone },
  });
  return (data.results ?? []).map(normalizeComplaint);
}

export async function fetchComplaintDetail(
  complaintId: string,
): Promise<ComplaintDetail> {
  const { data } = await api.get<ComplaintDetail>(
    `${COMPLAINTS_ENDPOINT}${complaintId}/`,
  );
  return normalizeComplaint(data);
}

export async function submitComplaint(
  input: SubmitComplaintInput,
): Promise<SubmitComplaintResult> {
  if (input.latitude == null || input.longitude == null) {
    throw new Error("location_required");
  }

  const formData = new FormData();
  const photoFile =
    input.photoFile ?? (await preparePhotoForUpload(input.photoUri));
  formData.append("photo", photoFile, photoFile.name);
  formData.append("latitude", String(input.latitude));
  formData.append("longitude", String(input.longitude));

  if (input.areaName?.trim()) {
    formData.append("area_name", input.areaName.trim());
  }
  if (input.note?.trim()) {
    formData.append("note", input.note.trim());
  }
  if (input.phone?.trim()) {
    formData.append("phone", input.phone.trim());
  }
  if (input.reporterName?.trim()) {
    formData.append("reporterName", input.reporterName.trim());
  }

  try {
    const { data } = await api.post<SubmitComplaintResult>(
      COMPLAINTS_ENDPOINT,
      formData,
      {
        // Let the browser set multipart/form-data with the correct boundary.
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );
    return data;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}
