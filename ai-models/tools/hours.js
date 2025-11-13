"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenAt = isOpenAt;
exports.normalizeOpenAt = normalizeOpenAt;
function isOpenAt(hours, weekday, time) {
    return hours.some((row) => row.day === weekday && row.open_time <= time && row.close_time >= time);
}
function normalizeOpenAt(value) {
    if (!value)
        return null;
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
    const normalized = hasZone ? value : `${value}+05:30`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime()))
        return null;
    const weekday = date
        .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
        .slice(0, 3)
        .toUpperCase();
    const time = date
        .toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    return { weekday, time };
}
//# sourceMappingURL=hours.js.map