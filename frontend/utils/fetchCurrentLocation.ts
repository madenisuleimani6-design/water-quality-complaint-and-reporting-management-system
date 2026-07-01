import * as Location from "expo-location";

import { roundCoordinate } from "./coordinates";

export type CurrentLocation = {
  latitude: number | null;
  longitude: number | null;
  areaName: string | null;
};

export async function fetchCurrentLocation(): Promise<CurrentLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { latitude: null, longitude: null, areaName: null };
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

    return {
      latitude: roundCoordinate(position.coords.latitude),
      longitude: roundCoordinate(position.coords.longitude),
      areaName,
    };
  } catch {
    return { latitude: null, longitude: null, areaName: null };
  }
}
