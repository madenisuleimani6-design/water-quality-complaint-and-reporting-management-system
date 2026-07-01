import { useCallback, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

import { submitComplaint, SubmitComplaintInput } from "../services/complaints";
import { enqueueSubmission } from "../utils/offlineQueue";

export type SubmitState = {
  isSubmitting: boolean;
  error: string | null;
  queuedOffline: boolean;
};

export function useSubmit() {
  const [state, setState] = useState<SubmitState>({
    isSubmitting: false,
    error: null,
    queuedOffline: false,
  });

  const submit = useCallback(async (input: SubmitComplaintInput) => {
    setState({ isSubmitting: true, error: null, queuedOffline: false });

    try {
      const network = await NetInfo.fetch();
      const isOnline = network.isConnected && network.isInternetReachable !== false;

      if (!isOnline) {
        await enqueueSubmission({
          photoUri: input.photoUri,
          latitude: input.latitude,
          longitude: input.longitude,
          note: input.note ?? "",
          phone: input.phone ?? "",
          reporterName: input.reporterName ?? "",
        });
        setState({ isSubmitting: false, error: null, queuedOffline: true });
        return { success: true as const, queued: true as const, complaintId: null };
      }

      const result = await submitComplaint(input);
      setState({ isSubmitting: false, error: null, queuedOffline: false });
      return {
        success: true as const,
        queued: false as const,
        complaintId: result.id,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Offline queue is full") {
        setState({
          isSubmitting: false,
          error: "queue_full",
          queuedOffline: false,
        });
        return { success: false as const, error: "queue_full" };
      }
      const message =
        error instanceof Error ? error.message : "submit failed";
      setState({ isSubmitting: false, error: message, queuedOffline: false });
      return { success: false as const, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...state, submit, clearError };
}
