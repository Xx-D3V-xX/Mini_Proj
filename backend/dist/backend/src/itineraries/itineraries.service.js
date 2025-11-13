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
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const SPEED_KMH = {
    WALK: 4,
    METRO: 34,
    BUS: 18,
    CAR: 26,
    AUTO: 20,
    MIXED: 12,
};
let ItinerariesService = class ItinerariesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        var _a, _b, _c, _d;
        const userId = (_a = dto.user_id) !== null && _a !== void 0 ? _a : (await this.ensureGuestUser()).id;
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const poiIds = dto.items.map((item) => item.poi_id);
        const pois = await this.prisma.poi.findMany({
            where: { id: { in: poiIds } },
            select: { id: true, name: true, latitude: true, longitude: true },
        });
        const poiMap = new Map(pois.map((poi) => [poi.id, poi]));
        for (const poiId of poiIds) {
            if (!poiMap.has(poiId)) {
                throw new common_1.NotFoundException(`POI ${poiId} not found`);
            }
        }
        const mode = (_b = dto.mode) !== null && _b !== void 0 ? _b : client_1.TravelMode.MIXED;
        const itineraryItems = this.buildItineraryItems(dto.items, poiMap, mode);
        const totalDistance = itineraryItems.reduce((sum, item) => { var _a; return sum + ((_a = item.leg_distance_km) !== null && _a !== void 0 ? _a : 0); }, 0);
        const totalTime = itineraryItems.reduce((sum, item) => { var _a; return sum + ((_a = item.leg_time_min) !== null && _a !== void 0 ? _a : 0); }, 0);
        const created = await this.prisma.itinerary.create({
            data: {
                user_id: userId,
                title: dto.title,
                date: dto.date ? new Date(dto.date) : null,
                share_token: this.generateShareToken(),
                total_distance_km: Number(totalDistance.toFixed(2)),
                total_time_min: Math.round(totalTime),
                items: {
                    create: itineraryItems.map((item, index) => {
                        var _a;
                        return ({
                            order_index: index,
                            poi_id: item.poi_id,
                            start_time: item.start_time,
                            end_time: item.end_time,
                            leg_distance_km: item.leg_distance_km,
                            leg_time_min: item.leg_time_min,
                            note: (_a = item.note) !== null && _a !== void 0 ? _a : null,
                        });
                    }),
                },
            },
            include: {
                items: true,
            },
        });
        return {
            id: created.id,
            title: created.title,
            date: created.date,
            total_distance_km: (_c = created.total_distance_km) !== null && _c !== void 0 ? _c : Number(totalDistance.toFixed(2)),
            total_time_min: (_d = created.total_time_min) !== null && _d !== void 0 ? _d : Math.round(totalTime),
            items: created.items.map((it) => ({
                poi_id: it.poi_id,
                start_time: it.start_time,
                end_time: it.end_time,
                leg_distance_km: it.leg_distance_km,
                leg_time_min: it.leg_time_min,
                note: it.note,
            })),
        };
    }
    async get(id) {
        var _a, _b, _c, _d;
        const itinerary = await this.prisma.itinerary.findUnique({
            where: { id },
            include: {
                items: {
                    orderBy: { order_index: 'asc' },
                    include: { poi: { select: { name: true } } },
                },
            },
        });
        if (!itinerary) {
            throw new common_1.NotFoundException('Itinerary not found');
        }
        return {
            id: itinerary.id,
            title: itinerary.title,
            date: itinerary.date,
            created_at: (_a = itinerary.created_at) !== null && _a !== void 0 ? _a : undefined,
            updated_at: (_b = itinerary.updated_at) !== null && _b !== void 0 ? _b : undefined,
            total_distance_km: (_c = itinerary.total_distance_km) !== null && _c !== void 0 ? _c : undefined,
            total_time_min: (_d = itinerary.total_time_min) !== null && _d !== void 0 ? _d : undefined,
            items: itinerary.items.map((it) => {
                var _a;
                return ({
                    poi_id: it.poi_id,
                    name: (_a = it.poi) === null || _a === void 0 ? void 0 : _a.name,
                    start_time: it.start_time,
                    end_time: it.end_time,
                    distance_km: it.leg_distance_km,
                    leg_distance_km: it.leg_distance_km,
                    leg_time_min: it.leg_time_min,
                    note: it.note,
                });
            }),
        };
    }
    async list(userId) {
        const itineraries = await this.prisma.itinerary.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                items: {
                    orderBy: { order_index: 'asc' },
                    include: { poi: { select: { name: true } } },
                },
            },
        });
        return itineraries.map((it) => {
            var _a, _b, _c, _d;
            return ({
                id: it.id,
                title: it.title,
                date: it.date,
                created_at: (_a = it.created_at) !== null && _a !== void 0 ? _a : undefined,
                updated_at: (_b = it.updated_at) !== null && _b !== void 0 ? _b : undefined,
                total_distance_km: (_c = it.total_distance_km) !== null && _c !== void 0 ? _c : undefined,
                total_time_min: (_d = it.total_time_min) !== null && _d !== void 0 ? _d : undefined,
                items: it.items.map((item) => {
                    var _a;
                    return ({
                        poi_id: item.poi_id,
                        name: (_a = item.poi) === null || _a === void 0 ? void 0 : _a.name,
                        start_time: item.start_time,
                        end_time: item.end_time,
                        distance_km: item.leg_distance_km,
                        leg_distance_km: item.leg_distance_km,
                        leg_time_min: item.leg_time_min,
                        note: item.note,
                    });
                }),
            });
        });
    }
    buildItineraryItems(items, poiMap, mode) {
        var _a;
        const speed = (_a = SPEED_KMH[mode]) !== null && _a !== void 0 ? _a : SPEED_KMH.MIXED;
        const parsed = items.map((item) => ({
            poi_id: item.poi_id,
            start_time: this.parseDate(item.start_time),
            end_time: this.parseDate(item.end_time),
            note: item.note,
            leg_distance_km: 0,
            leg_time_min: 0,
        }));
        for (let i = 1; i < parsed.length; i += 1) {
            const prevPoi = poiMap.get(parsed[i - 1].poi_id);
            const currentPoi = poiMap.get(parsed[i].poi_id);
            const distance = this.distanceKm(prevPoi.latitude, prevPoi.longitude, currentPoi.latitude, currentPoi.longitude);
            parsed[i].leg_distance_km = Number(distance.toFixed(2));
            parsed[i].leg_time_min = Math.max(1, Math.round((distance / speed) * 60));
        }
        return parsed;
    }
    parseDate(value) {
        if (!value)
            return null;
        const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
        const normalized = hasZone ? value : `${value}+05:30`;
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    distanceKm(lat1, lon1, lat2, lon2) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    generateShareToken() {
        return (0, crypto_1.randomBytes)(8).toString('hex');
    }
    async ensureGuestUser() {
        return this.prisma.user.upsert({
            where: { email: 'guest@mumbai-trails.local' },
            update: {},
            create: {
                email: 'guest@mumbai-trails.local',
                password_hash: 'guest',
                name: 'Guest',
                role: 'USER',
            },
        });
    }
};
exports.ItinerariesService = ItinerariesService;
exports.ItinerariesService = ItinerariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItinerariesService);
//# sourceMappingURL=itineraries.service.js.map