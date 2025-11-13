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
var AiClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("../common/config");
let AiClientService = AiClientService_1 = class AiClientService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiClientService_1.name);
        this.client = axios_1.default.create({
            baseURL: this.config.aiBaseUrl,
            timeout: 4000,
        });
    }
    async recommend(payload) {
        return this.post('/recommend', payload);
    }
    async itinerary(payload) {
        return this.post('/itinerary', payload);
    }
    async travelTime(payload) {
        return this.post('/travel-time', payload);
    }
    async chat(payload) {
        return this.post('/chat', payload);
    }
    async weather() {
        return this.get('/weather');
    }
    async post(path, body) {
        try {
            const { data } = await this.client.post(path, body);
            return data;
        }
        catch (err) {
            this.logger.error(`AI request ${path} failed`, err.stack);
            throw err;
        }
    }
    async get(path) {
        try {
            const { data } = await this.client.get(path);
            return data;
        }
        catch (err) {
            this.logger.error(`AI request ${path} failed`, err.stack);
            throw err;
        }
    }
};
exports.AiClientService = AiClientService;
exports.AiClientService = AiClientService = AiClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.AppConfigService])
], AiClientService);
//# sourceMappingURL=ai-client.service.js.map