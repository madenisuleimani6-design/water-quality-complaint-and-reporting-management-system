export function roundCoordinate(
  value: number | null | undefined,
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function formatCoordinateDisplay(
  value: number | string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const numeric =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numeric)) return null;
  return numeric.toFixed(6);
}

export function roundLocation<T extends {
  latitude: number | null;
  longitude: number | null;
}>(location: T): T {
  return {
    ...location,
    latitude: roundCoordinate(location.latitude),
    longitude: roundCoordinate(location.longitude),
  };
}
