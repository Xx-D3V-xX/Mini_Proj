import { TravelMode } from '@prisma/client';
export declare function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function estimateLeg(lat1: number, lon1: number, lat2: number, lon2: number, mode: TravelMode): {
    distance_km: number;
    time_min: number;
};
