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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview() {
        const [poiCount, itineraryCount, categories] = await this.prisma.$transaction([
            this.prisma.poi.count(),
            this.prisma.itinerary.count(),
            this.prisma.category.findMany({
                select: {
                    slug: true,
                    display_name: true,
                    poi_links: {
                        select: {
                            poi: { select: { rating: true } },
                        },
                    },
                },
            }),
        ]);
        const categoryStats = categories.map((category) => {
            const ratings = category.poi_links
                .map((link) => link.poi.rating)
                .filter((value) => typeof value === 'number');
            const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
            return {
                slug: category.slug,
                name: category.display_name,
                avgRating,
                count: category.poi_links.length,
            };
        });
        return { poiCount, itineraryCount, categories: categoryStats };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map