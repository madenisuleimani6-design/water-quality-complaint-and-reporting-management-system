import { roundCoordinate } from "@/utils/coordinates";

export type CurrentLocation = {
  latitude: number | null;
  longitude: number | null;
  areaName: string | null;
};

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "14");
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      address?: {
        suburb?: string;
        city_district?: string;
        city?: string;
        town?: string;
        state?: string;
      };
    };
    const addr = data.address;
    if (!addr) return null;
    return [addr.suburb ?? addr.city_district, addr.city ?? addr.town, addr.state]
      .filter(Boolean)
      .join(", ");
  } catch {
    return null;
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

export async function fetchCurrentLocation(): Promise<CurrentLocation> {
  try {
    const position = await getPosition();
    const latitude = roundCoordinate(position.coords.latitude);
    const longitude = roundCoordinate(position.coords.longitude);
    let areaName: string | null = null;
    if (latitude != null && longitude != null) {
      areaName = await reverseGeocode(latitude, longitude);
    }
    return { latitude, longitude, areaName };
  } catch {
    return { latitude: null, longitude: null, areaName: null };
  }
}
