import { useCallback, useEffect, useState } from "react";

import {
  fetchAccurateLocation,
  watchAccurateLocation,
  type CurrentLocation,
} from "@/lib/geolocation";

export type LocationState = CurrentLocation & {
  loading: boolean;
  error: string | null;
};

type UseLocationOptions = {
  /** Keep GPS updated while the report camera screen is open. */
  watch?: boolean;
};

export function useLocation(options: UseLocationOptions = {}): LocationState & {
  refresh: () => Promise<CurrentLocation>;
} {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    areaName: null,
    loading: true,
    error: null,
  });

  const applyLocation = useCallback((location: CurrentLocation) => {
    setState({
      ...location,
      loading: false,
      error:
        location.latitude == null && location.longitude == null
          ? "unavailable"
          : null,
    });
  }, []);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const location = await fetchAccurateLocation();
    applyLocation(location);
    return location;
  }, [applyLocation]);

  useEffect(() => {
    if (options.watch) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const stop = watchAccurateLocation(
        applyLocation,
        () => applyLocation({ latitude: null, longitude: null, areaName: null }),
      );
      return stop;
    }

    let active = true;
    void fetchAccurateLocation().then((location) => {
      if (active) applyLocation(location);
    });
    return () => {
      active = false;
    };
  }, [applyLocation, options.watch]);

  return { ...state, refresh };
}
