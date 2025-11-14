"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceKm = distanceKm;
exports.estimateLeg = estimateLeg;
const SPEED_KMH = {
    WALK: 4,
    METRO: 34,
    BUS: 18,
    CAR: 26,
    AUTO: 20,
    MIXED: 15,
};
function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function estimateLeg(lat1, lon1, lat2, lon2, mode) {
    var _a;
    const distance = distanceKm(lat1, lon1, lat2, lon2);
    const speed = (_a = SPEED_KMH[mode]) !== null && _a !== void 0 ? _a : SPEED_KMH.MIXED;
    const minutes = Math.max(1, Math.round((distance / speed) * 60));
    return { distance_km: Number(distance.toFixed(2)), time_min: minutes };
}
//# sourceMappingURL=routing_estimator.js.map