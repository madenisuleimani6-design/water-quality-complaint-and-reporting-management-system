import { useEffect } from "react";

import { subscribeOnline } from "@/lib/online";
import { submitComplaint } from "@/services/complaints";
import { flushQueue } from "@/utils/offlineQueue";

export function useOfflineSync() {
  useEffect(() => {
    const flush = async () => {
      await flushQueue(async (item) => {
        await submitComplaint({
          photoUri: item.photoUri,
          latitude: item.latitude,
          longitude: item.longitude,
          areaName: item.areaName,
          note: item.note,
          phone: item.phone || undefined,
          reporterName: item.reporterName || undefined,
        });
      });
    };

    return subscribeOnline((online) => {
      if (online) void flush();
    });
  }, []);
}
