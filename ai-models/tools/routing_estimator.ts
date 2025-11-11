import { TravelMode } from '@prisma/client';

const SPEED_KMH: Record<TravelMode, number> = {
  WALK: 4,
  METRO: 34,
  BUS: 18,
  CAR: 26,
  AUTO: 20,
  MIXED: 15,
};

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateLeg(lat1: number, lon1: number, lat2: number, lon2: number, mode: TravelMode) {
  const distance = distanceKm(lat1, lon1, lat2, lon2);
  const speed = SPEED_KMH[mode] ?? SPEED_KMH.MIXED;
  const minutes = Math.max(1, Math.round((distance / speed) * 60));
  return { distance_km: Number(distance.toFixed(2)), time_min: minutes };
}
