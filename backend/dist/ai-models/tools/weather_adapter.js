"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherAdapter = void 0;
class WeatherAdapter {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(lat, lon) {
        var _a, _b, _c, _d;
        const existing = await this.prisma.weatherCache.findFirst({
            where: { lat, lon },
            orderBy: { ts: 'desc' },
        });
        if (existing) {
            const payload = (_a = existing.payload) !== null && _a !== void 0 ? _a : {};
            return {
                summary: (_b = payload.summary) !== null && _b !== void 0 ? _b : 'Clear',
                temp_c: (_c = payload.temp_c) !== null && _c !== void 0 ? _c : 30,
                humidity: (_d = payload.humidity) !== null && _d !== void 0 ? _d : 70,
                fetched_at: existing.ts,
            };
        }
        return {
            summary: 'Pleasant skies',
            temp_c: 30,
            humidity: 68,
            fetched_at: new Date(),
        };
    }
}
exports.WeatherAdapter = WeatherAdapter;
//# sourceMappingURL=weather_adapter.js.map