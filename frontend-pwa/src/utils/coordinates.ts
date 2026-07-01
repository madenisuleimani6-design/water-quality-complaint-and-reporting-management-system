export function roundCoordinate(
  value: number | null | undefined,
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 1_000_000) / 1_000_000;
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
