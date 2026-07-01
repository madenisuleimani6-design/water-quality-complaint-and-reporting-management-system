import { useEffect, useState } from "react";
import * as Location from "expo-location";

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

    async function fetchLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (active) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "denied",
            }));
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let areaName: string | null = null;
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          if (places[0]) {
            const place = places[0];
            areaName = [place.district, place.city, place.region]
              .filter(Boolean)
              .join(", ");
          }
        } catch {
          areaName = null;
        }

        if (active) {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            areaName,
            loading: false,
            error: null,
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

    fetchLocation();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
