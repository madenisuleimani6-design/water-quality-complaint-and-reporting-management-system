import { roundCoordinate } from "@/utils/coordinates";

export type CurrentLocation = {
  latitude: number | null;
  longitude: number | null;
  areaName: string | null;
};

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
};

const FALLBACK_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 12000,
  maximumAge: 0,
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
    url.searchParams.set("zoom", "18");
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      address?: {
        suburb?: string;
        neighbourhood?: string;
        city_district?: string;
        quarter?: string;
        village?: string;
        residential?: string;
        road?: string;
        city?: string;
        town?: string;
      };
    };
    const addr = data.address;
    if (!addr) return null;

    const localArea =
      addr.suburb ??
      addr.neighbourhood ??
      addr.city_district ??
      addr.quarter ??
      addr.village ??
      addr.residential ??
      addr.road;
    if (!localArea) return null;

    return [localArea, addr.city ?? addr.town].filter(Boolean).join(", ");
  } catch {
    return null;
  }
}

function getPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function positionToLocation(position: GeolocationPosition): CurrentLocation {
  return {
    latitude: roundCoordinate(position.coords.latitude),
    longitude: roundCoordinate(position.coords.longitude),
    areaName: null,
  };
}

export async function fetchAccurateLocation(): Promise<CurrentLocation> {
  if (!navigator.geolocation) {
    return { latitude: null, longitude: null, areaName: null };
  }

  let position: GeolocationPosition | null = null;

  try {
    position = await getPosition(HIGH_ACCURACY_OPTIONS);
  } catch {
    try {
      position = await getPosition(FALLBACK_OPTIONS);
    } catch {
      return { latitude: null, longitude: null, areaName: null };
    }
  }

  const location = positionToLocation(position);
  if (location.latitude != null && location.longitude != null) {
    location.areaName = await reverseGeocode(
      location.latitude,
      location.longitude,
    );
  }
  return location;
}

/** @deprecated Use fetchAccurateLocation for complaint capture. */
export async function fetchCurrentLocation(): Promise<CurrentLocation> {
  return fetchAccurateLocation();
}

export function watchAccurateLocation(
  onUpdate: (location: CurrentLocation) => void,
  onError?: () => void,
): () => void {
  if (!navigator.geolocation) {
    onError?.();
    return () => undefined;
  }

  let active = true;
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      if (!active) return;
      const location = positionToLocation(position);
      onUpdate(location);
      if (location.latitude == null || location.longitude == null) {
        return;
      }
      void reverseGeocode(location.latitude, location.longitude).then((areaName) => {
        if (!active) return;
        onUpdate({ ...location, areaName });
      });
    },
    () => onError?.(),
    HIGH_ACCURACY_OPTIONS,
  );

  return () => {
    active = false;
    navigator.geolocation.clearWatch(watchId);
  };
}
