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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_client_service_1 = require("./ai-client.service");
const weather_client_service_1 = require("./weather-client.service");
const prisma_service_1 = require("../prisma/prisma.service");
let IntegrationsController = class IntegrationsController {
    constructor(aiClient, weatherClient, prisma) {
        this.aiClient = aiClient;
        this.weatherClient = weatherClient;
        this.prisma = prisma;
    }
    async recommend(payload) {
        try {
            return await this.aiClient.recommend(payload);
        }
        catch (err) {
            const mood = ((payload === null || payload === void 0 ? void 0 : payload.mood) || '').toString().toLowerCase();
            const moodTagMap = {
                chill: ['sunset', 'seaside', 'cafe', 'family'],
                foodie: ['food', 'dessert', 'street-food'],
                adventure: ['outdoor', 'trek', 'viewpoint'],
                romantic: ['sunset', 'seaside', 'viewpoint'],
                family: ['family', 'museum', 'park'],
            };
            const tags = moodTagMap[mood] || [];
            const where = tags.length
                ? { tag_links: { some: { tag: { slug: { in: tags } } } } }
                : {};
            const pois = await this.prisma.poi.findMany({
                where,
                orderBy: { rating: 'desc' },
                take: 10,
                select: { id: true, name: true, latitude: true, longitude: true, rating: true, price_level: true },
            });
            const finalPois = pois.length
                ? pois
                : await this.prisma.poi.findMany({
                    orderBy: { rating: 'desc' },
                    take: 10,
                    select: { id: true, name: true, latitude: true, longitude: true, rating: true, price_level: true },
                });
            return {
                pois: finalPois.map((p) => {
                    var _a, _b;
                    return ({
                        id: p.id,
                        name: p.name,
                        lat: p.latitude,
                        lon: p.longitude,
                        rating: (_a = p.rating) !== null && _a !== void 0 ? _a : 0,
                        price_level: (_b = p.price_level) !== null && _b !== void 0 ? _b : 0,
                    });
                }),
            };
        }
    }
    chat(payload) {
        return this.aiClient.chat(payload);
    }
    travelTime(payload) {
        return this.aiClient.travelTime(payload);
    }
    weather() {
        return this.weatherClient.current();
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Post)('recommend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "recommend", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('travel-time'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "travelTime", null);
__decorate([
    (0, common_1.Get)('weather'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "weather", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [ai_client_service_1.AiClientService,
        weather_client_service_1.WeatherClientService,
        prisma_service_1.PrismaService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map