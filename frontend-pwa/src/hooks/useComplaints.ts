import { useCallback, useEffect, useRef, useState } from "react";

import type { ComplaintSummary } from "@/types/citizen";
import { listComplaintsByPhone } from "@/services/complaints";

export function useComplaints(phone: string) {
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneRef = useRef(phone);
  phoneRef.current = phone;

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    const currentPhone = phoneRef.current.trim();
    if (!currentPhone) {
      setComplaints((prev) => (prev.length === 0 ? prev : []));
      setError((prev) => (prev === null ? prev : null));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const results = await listComplaintsByPhone(currentPhone);
      setComplaints(results);
    } catch {
      setComplaints([]);
      setError("fetch_failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refetch = useCallback(() => {
    void fetchComplaints(true);
  }, [fetchComplaints]);

  useEffect(() => {
    void fetchComplaints(false);
  }, [phone, fetchComplaints]);

  return { complaints, loading, refreshing, error, refetch };
}
