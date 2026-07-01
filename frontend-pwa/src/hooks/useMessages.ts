import { useCallback, useEffect, useState } from "react";

import { isOnline } from "@/lib/online";
import type { CitizenMessage, MessageProfileSnapshot } from "@/types/citizen";
import { fetchMessages, sendMessage } from "@/services/messages";
import {
  appendMessage,
  loadMessages,
  removeMessage,
  updateMessageStatus,
} from "@/utils/messagesStorage";

function sortMessages(items: CitizenMessage[]): CitizenMessage[] {
  return [...items].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );
}

function isServerMessageId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function mergeMessages(
  server: CitizenMessage[],
  local: CitizenMessage[],
): CitizenMessage[] {
  const unsynced = local.filter(
    (item) =>
      (item.status === "pending" || item.status === "failed") &&
      !isServerMessageId(item.id),
  );
  return sortMessages([...unsynced, ...server]);
}

export function useMessages(profileSnapshot: MessageProfileSnapshot | null) {
  const [messages, setMessages] = useState<CitizenMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const local = await loadMessages();

    if (!profileSnapshot?.phone) {
      setMessages(local);
      setLoading(false);
      return;
    }

    if (!isOnline()) {
      setMessages(local);
      setLoading(false);
      return;
    }

    try {
      const server = await fetchMessages();
      const merged = mergeMessages(server, local);
      setMessages(merged);
    } catch {
      setMessages(local);
    } finally {
      setLoading(false);
    }
  }, [profileSnapshot?.phone]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const send = useCallback(
    async (body: string) => {
      if (
        !profileSnapshot?.phone ||
        !profileSnapshot.fullName?.trim() ||
        !body.trim()
      ) {
        setError("profile_required");
        return false;
      }
      setSending(true);
      setError(null);
      const entry = await appendMessage({
        body: body.trim(),
        profileSnapshot,
        status: "pending",
      });
      setMessages((prev) => sortMessages([entry, ...prev]));

      try {
        if (!isOnline()) {
          setSending(false);
          return true;
        }
        const saved = await sendMessage({ message: body.trim() });
        await removeMessage(entry.id);
        setMessages((prev) =>
          sortMessages([
            saved,
            ...prev.filter((item) => item.id !== entry.id),
          ]),
        );
        return true;
      } catch {
        await updateMessageStatus(entry.id, "failed");
        const local = await loadMessages();
        setMessages(local);
        setError("send_failed");
        return false;
      } finally {
        setSending(false);
      }
    },
    [profileSnapshot],
  );

  return {
    messages,
    sending,
    loading,
    error,
    send,
    refresh,
    clearError: () => setError(null),
  };
}
