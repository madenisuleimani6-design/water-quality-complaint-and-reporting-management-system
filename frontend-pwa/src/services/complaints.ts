import { COMPLAINTS_ENDPOINT, resolveMediaUrl } from "@/constants/config";
import type { ComplaintDetail, ComplaintSummary } from "@/types/citizen";
import { api } from "./api";

export type SubmitComplaintInput = {
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
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
  const formData = new FormData();
  const filename = input.photoUri.split("/").pop() ?? "photo.jpg";
  const response = await fetch(input.photoUri);
  const blob = await response.blob();
  formData.append("photo", blob, filename);

  if (input.latitude !== null) {
    formData.append("latitude", String(input.latitude));
  }
  if (input.longitude !== null) {
    formData.append("longitude", String(input.longitude));
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

  const { data } = await api.post<SubmitComplaintResult>(
    COMPLAINTS_ENDPOINT,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (payload) => payload,
    },
  );

  return data;
}
