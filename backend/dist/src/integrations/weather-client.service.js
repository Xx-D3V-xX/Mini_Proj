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
        var _a;
        const mode = (_a = this.config.get('WEATHER_MODE')) !== null && _a !== void 0 ? _a : 'mock';
        if (mode === 'live') {
            const apiKey = this.config.get('WEATHER_API_KEY');
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
            const { data } = await axios_1.default.get(url);
            return {
                status: data.current_weather.weathercode,
                description: 'Live weather snapshot',
                temperature_c: data.current_weather.temperature,
                humidity: 70,
                icon: 'live',
            };
        }
        return {
            status: 'mock',
            description: 'Humid with coastal breeze',
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