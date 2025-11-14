"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let WeatherClientService = class WeatherClientService {
    constructor(config) {
        this.config = config;
    }
    async current(lat = 19.076, lng = 72.8777) {
        var _a, _b, _c, _d, _e;
        const mode = ((_a = this.config.get('WEATHER_MODE')) !== null && _a !== void 0 ? _a : 'mock').toLowerCase();
        if (mode === 'live' || mode === 'api') {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
            const { data } = await axios_1.default.get(url);
            const temperature = (_c = (_b = data === null || data === void 0 ? void 0 : data.current_weather) === null || _b === void 0 ? void 0 : _b.temperature) !== null && _c !== void 0 ? _c : null;
            return {
                summary: 'Live weather snapshot',
                advice: temperature && temperature > 34 ? 'High heat expected; schedule outdoor plans for evening.' : 'Weather looks fine. Keep hydrated.',
                status: (_e = (_d = data === null || data === void 0 ? void 0 : data.current_weather) === null || _d === void 0 ? void 0 : _d.weathercode) !== null && _e !== void 0 ? _e : 'live',
                temperature_c: temperature,
                humidity: 70,
                icon: 'live',
            };
        }
        return {
            summary: 'Mock: Warm with coastal breeze',
            advice: 'Carry water; plan indoor in afternoon heat.',
            status: 'mock',
            temperature_c: 29,
            humidity: 78,
            icon: 'sun',
        };
    }
};
exports.WeatherClientService = WeatherClientService;
exports.WeatherClientService = WeatherClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WeatherClientService);
//# sourceMappingURL=weather-client.service.js.map