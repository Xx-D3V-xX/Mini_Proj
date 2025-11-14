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
let IntegrationsController = class IntegrationsController {
    constructor(aiClient, weatherClient) {
        this.aiClient = aiClient;
        this.weatherClient = weatherClient;
    }
    recommend(payload) {
        return this.aiClient.recommend(payload);
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
    __metadata("design:returntype", void 0)
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
        weather_client_service_1.WeatherClientService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map