import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { submitComplaint } from "../services/complaints";
import { flushQueue } from "../utils/offlineQueue";

export function useOfflineSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;
      if (!isOnline) {
        return;
      }

      await flushQueue(async (item) => {
        await submitComplaint({
          photoUri: item.photoUri,
          latitude: item.latitude,
          longitude: item.longitude,
          note: item.note,
          phone: item.phone || undefined,
          reporterName: item.reporterName || undefined,
        });
      });
    });

    return unsubscribe;
  }, []);
}
