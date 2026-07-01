import { useEffect, useState } from "react";

import { fetchCurrentLocation } from "@/lib/geolocation";

export type LocationState = {
  latitude: number | null;
  longitude: number | null;
  areaName: string | null;
  loading: boolean;
  error: string | null;
};

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    areaName: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const location = await fetchCurrentLocation();
        if (active) {
          setState({
            ...location,
            loading: false,
            error:
              location.latitude == null && location.longitude == null
                ? "unavailable"
                : null,
          });
        }
      } catch {
        if (active) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "unavailable",
          }));
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
