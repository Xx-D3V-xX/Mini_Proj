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
exports.ItinerariesService = void 0;
const common_1 = require("@nestjs/common");
const ai_client_service_1 = require("../integrations/ai-client.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ItinerariesService = class ItinerariesService {
    constructor(prisma, aiClient) {
        this.prisma = prisma;
        this.aiClient = aiClient;
    }
    async generate(userId, dto) {
        var _a;
        const aiPlan = await this.aiClient.itinerary({
            mood: dto.mood,
            start_location: dto.start_location,
            time_window: dto.time_window,
            poi_ids: dto.poi_ids,
        });
        const itinerary = await this.prisma.itinerary.create({
            data: {
                user_id: userId,
                title: (_a = aiPlan.title) !== null && _a !== void 0 ? _a : `${dto.mood} Trail`,
                items: aiPlan.items,
                total_distance_km: aiPlan.total_distance_km,
                total_time_min: aiPlan.total_time_min,
            },
        });
        return itinerary;
    }
    async list(userId) {
        return this.prisma.itinerary.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    }
    async get(userId, id) {
        const itinerary = await this.prisma.itinerary.findFirst({ where: { id, user_id: userId } });
        if (!itinerary) {
            throw new common_1.NotFoundException('Itinerary not found');
        }
        return itinerary;
    }
};
exports.ItinerariesService = ItinerariesService;
exports.ItinerariesService = ItinerariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, ai_client_service_1.AiClientService])
], ItinerariesService);
//# sourceMappingURL=itineraries.service.js.map