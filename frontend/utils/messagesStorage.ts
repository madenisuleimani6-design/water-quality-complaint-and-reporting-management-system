import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "../constants/config";
import { CitizenMessage } from "../types/citizen";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function loadMessages(): Promise<CitizenMessage[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.messagesOutbox);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as CitizenMessage[];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: CitizenMessage[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.messagesOutbox, JSON.stringify(messages));
}

export async function appendMessage(
  message: Omit<CitizenMessage, "id" | "sentAt">,
): Promise<CitizenMessage> {
  const messages = await loadMessages();
  const entry: CitizenMessage = {
    ...message,
    id: generateId(),
    sentAt: new Date().toISOString(),
  };
  await saveMessages([entry, ...messages]);
  return entry;
}

export async function updateMessageStatus(
  id: string,
  status: CitizenMessage["status"],
): Promise<void> {
  const messages = await loadMessages();
  const updated = messages.map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  await saveMessages(updated);
}

export async function removeMessage(id: string): Promise<void> {
  const messages = await loadMessages();
  await saveMessages(messages.filter((item) => item.id !== id));
}
