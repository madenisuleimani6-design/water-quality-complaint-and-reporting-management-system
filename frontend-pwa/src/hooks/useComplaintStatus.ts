import { useEffect, useState } from "react";

import { getWebSocketUrl } from "@/constants/config";

export type ComplaintStatus =
  | "new"
  | "assigned"
  | "investigating"
  | "resolved";

const VALID_STATUSES: ComplaintStatus[] = [
  "new",
  "assigned",
  "investigating",
  "resolved",
];

function parseStatus(value: unknown): ComplaintStatus {
  if (typeof value === "string" && VALID_STATUSES.includes(value as ComplaintStatus)) {
    return value as ComplaintStatus;
  }
  return "new";
}

export function useComplaintStatus(complaintId: string | undefined) {
  const [status, setStatus] = useState<ComplaintStatus>("new");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!complaintId) return;

    let socket: WebSocket | null = null;
    let closed = false;

    try {
      socket = new WebSocket(getWebSocketUrl(complaintId));

      socket.onopen = () => {
        if (!closed) setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data));
          setStatus(parseStatus(payload.status));
        } catch {
          setStatus("new");
        }
      };

      socket.onerror = () => {
        if (!closed) setConnected(false);
      };

      socket.onclose = () => {
        if (!closed) setConnected(false);
      };
    } catch {
      setConnected(false);
    }

    return () => {
      closed = true;
      socket?.close();
    };
  }, [complaintId]);

  return { status, connected };
}
