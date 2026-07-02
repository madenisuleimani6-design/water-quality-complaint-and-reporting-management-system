import { buildApiUrl, COMPLAINTS_ENDPOINT, resolveMediaUrl } from "@/constants/config";
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
  const photoUrl = resolveMediaUrl(row.photoUrl ?? (row as { photo_url?: string }).photo_url);
  return {
    ...row,
    photoUrl,
  };
}

function formatPayloadError(data: unknown, status: number): string {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const detail = record.detail;
    if (typeof detail === "string" && detail.trim()) return detail.trim();
    if (Array.isArray(detail)) {
      const text = detail.filter((item) => typeof item === "string").join(", ");
      if (text) return text;
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
  return `Upload failed (${status})`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
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

  let photoFile = input.photoFile;
  if (!photoFile || photoFile.size === 0) {
    photoFile = await preparePhotoForUpload(input.photoUri);
  }
  if (photoFile.size === 0) {
    throw new Error("Photo is empty. Please retake the picture.");
  }

  const formData = new FormData();
  formData.append("photo", photoFile, photoFile.name || "complaint-photo.jpg");
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

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(buildApiUrl(COMPLAINTS_ENDPOINT), {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(formatPayloadError(payload, response.status));
    }

    const data = payload as SubmitComplaintResult;
    if (!data?.id) {
      throw new Error("Server did not return a complaint id.");
    }
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the server. Check your internet connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Upload failed");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
