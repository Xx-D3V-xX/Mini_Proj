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
exports.PoisService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const sync_1 = require("csv-parse/sync");
const prisma_service_1 = require("../prisma/prisma.service");
let PoisService = class PoisService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        var _a;
        const take = 20;
        const page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
        const skip = (page - 1) * take;
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category) {
            where.category = { contains: query.category, mode: 'insensitive' };
        }
        if (query.tags) {
            const tags = query.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
            if (tags.length) {
                where.tags = { hasSome: tags };
            }
        }
        if (query.rating_min !== undefined) {
            where.rating = { gte: query.rating_min };
        }
        if (query.price_level !== undefined) {
            where.price_level = { lte: query.price_level };
        }
        if (query.bbox) {
            const [minLat, minLng, maxLat, maxLng] = query.bbox.split(',').map(Number);
            where.AND = [
                { latitude: { gte: minLat } },
                { latitude: { lte: maxLat } },
                { longitude: { gte: minLng } },
                { longitude: { lte: maxLng } },
            ];
        }
        const orderBy = this.resolveSort(query.sort);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.poi.findMany({ where, skip, take, orderBy }),
            this.prisma.poi.count({ where }),
        ]);
        return { items, total, page, pages: Math.ceil(total / take) };
    }
    async findOne(id) {
        const poi = await this.prisma.poi.findUnique({ where: { id } });
        if (!poi) {
            throw new common_1.NotFoundException('POI not found');
        }
        return poi;
    }
    async create(dto) {
        var _a;
        return this.prisma.poi.create({
            data: {
                ...dto,
                opening_hours: ((_a = dto.opening_hours) !== null && _a !== void 0 ? _a : client_1.Prisma.JsonNull),
            },
        });
    }
    async update(id, dto) {
        var _a;
        await this.findOne(id);
        const data = { ...dto };
        if (dto.opening_hours !== undefined) {
            data.opening_hours = ((_a = dto.opening_hours) !== null && _a !== void 0 ? _a : client_1.Prisma.JsonNull);
        }
        return this.prisma.poi.update({ where: { id }, data });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.poi.delete({ where: { id } });
        return { success: true };
    }
    async importCsv(buffer) {
        const rows = (0, sync_1.parse)(buffer, { columns: true, skip_empty_lines: true });
        const writes = [];
        for (const row of rows) {
            const tags = (row.tags || '')
                .split('|')
                .map((tag) => tag.trim())
                .filter(Boolean);
            const opening_hours = this.safeJson(row.opening_hours);
            writes.push(this.prisma.poi.upsert({
                where: { id: row.id },
                create: {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    category: row.category,
                    latitude: Number(row.latitude),
                    longitude: Number(row.longitude),
                    rating: row.rating ? Number(row.rating) : null,
                    price_level: row.price_level ? Number(row.price_level) : null,
                    tags,
                    opening_hours: opening_hours !== null && opening_hours !== void 0 ? opening_hours : client_1.Prisma.JsonNull,
                    image_url: row.image_url,
                },
                update: {
                    name: row.name,
                    description: row.description,
                    category: row.category,
                    latitude: Number(row.latitude),
                    longitude: Number(row.longitude),
                    rating: row.rating ? Number(row.rating) : null,
                    price_level: row.price_level ? Number(row.price_level) : null,
                    tags,
                    opening_hours: opening_hours !== null && opening_hours !== void 0 ? opening_hours : client_1.Prisma.JsonNull,
                    image_url: row.image_url,
                },
            }));
        }
        await this.prisma.$transaction(writes);
        return { imported: rows.length };
    }
    safeJson(value) {
        try {
            return value ? JSON.parse(value) : null;
        }
        catch (err) {
            return null;
        }
    }
    resolveSort(sort) {
        if (!sort)
            return { created_at: client_1.Prisma.SortOrder.desc };
        switch (sort) {
            case 'rating_desc':
                return { rating: client_1.Prisma.SortOrder.desc };
            case 'rating_asc':
                return { rating: client_1.Prisma.SortOrder.asc };
            default:
                return { created_at: client_1.Prisma.SortOrder.desc };
        }
    }
};
exports.PoisService = PoisService;
exports.PoisService = PoisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PoisService);
//# sourceMappingURL=pois.service.js.map