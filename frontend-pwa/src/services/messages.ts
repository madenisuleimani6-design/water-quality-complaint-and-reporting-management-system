import { MESSAGES_ENDPOINT } from "@/constants/config";
import type { CitizenMessage } from "@/types/citizen";
import { api } from "./api";

export type ApiMessage = {
  id: string;
  message: string;
  sentAt: string;
  status: string;
  adminReply?: string;
  adminRepliedAt?: string | null;
};

export type SendMessageInput = {
  message: string;
};

export function mapApiMessage(item: ApiMessage): CitizenMessage {
  return {
    id: item.id,
    body: item.message,
    sentAt: item.sentAt,
    status: item.status === "failed" ? "failed" : "sent",
    adminReply: item.adminReply || null,
    adminRepliedAt: item.adminRepliedAt ?? null,
  };
}

export async function fetchMessages(): Promise<CitizenMessage[]> {
  const { data } = await api.get<ApiMessage[]>(MESSAGES_ENDPOINT);
  return data.map(mapApiMessage);
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<CitizenMessage> {
  const { data } = await api.post<ApiMessage>(MESSAGES_ENDPOINT, input);
  return mapApiMessage(data);
}
