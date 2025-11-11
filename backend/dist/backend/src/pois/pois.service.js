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
const sync_1 = require("csv-parse/sync");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let PoisService = class PoisService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPoiDetails(id) {
        const poi = await this.prisma.poi.findUnique({
            where: { id },
            include: {
                opening_hours: true,
                category_links: { include: { category: true } },
                tag_links: { include: { tag: true } },
            },
        });
        if (!poi) {
            throw new common_1.NotFoundException('POI not found');
        }
        const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const opening_hours = [...poi.opening_hours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        return {
            id: poi.id,
            slug: poi.slug,
            name: poi.name,
            description: poi.description,
            address: poi.address,
            locality: poi.locality,
            city: poi.city,
            latitude: poi.latitude,
            longitude: poi.longitude,
            rating: poi.rating,
            price_level: poi.price_level,
            ticket_price_inr: poi.ticket_price_inr,
            best_time_of_day: poi.best_time_of_day,
            indoor_outdoor: poi.indoor_outdoor,
            time_spent_min: poi.time_spent_min,
            website_url: poi.website_url,
            phone: poi.phone,
            image_url: poi.image_url,
            categories: poi.category_links.map((link) => ({
                slug: link.category.slug,
                name: link.category.display_name,
            })),
            tags: poi.tag_links.map((link) => ({
                slug: link.tag.slug,
                name: link.tag.display_name,
            })),
            opening_hours: opening_hours.map((hour) => ({
                day: hour.day,
                open_time: hour.open_time,
                close_time: hour.close_time,
            })),
        };
    }
    async search(query) {
        var _a;
        const filters = [];
        if (query.q) {
            const searchTerm = query.q.trim();
            filters.push({
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ],
            });
        }
        if (query.category) {
            filters.push({
                category_links: { some: { category: { slug: query.category } } },
            });
        }
        if (query.tag) {
            filters.push({ tag_links: { some: { tag: { slug: query.tag } } } });
        }
        if (query.min_rating !== undefined) {
            filters.push({ rating: { gte: query.min_rating } });
        }
        if (query.max_price !== undefined) {
            filters.push({ price_level: { lte: query.max_price } });
        }
        let bboxCenter;
        if (query.bbox) {
            const bbox = query.bbox.split(',').map(Number);
            const [minLat, minLon, maxLat, maxLon] = bbox;
            filters.push({
                latitude: { gte: Math.min(minLat, maxLat), lte: Math.max(minLat, maxLat) },
                longitude: { gte: Math.min(minLon, maxLon), lte: Math.max(minLon, maxLon) },
            });
            bboxCenter = {
                lat: (minLat + maxLat) / 2,
                lon: (minLon + maxLon) / 2,
            };
        }
        const openContext = this.normalizeOpenAt(query.open_at);
        if (openContext) {
            filters.push({
                opening_hours: {
                    some: {
                        day: openContext.weekday,
                        open_time: { lte: openContext.time },
                        close_time: { gte: openContext.time },
                    },
                },
            });
        }
        else if (query.weekday) {
            filters.push({ opening_hours: { some: { day: query.weekday } } });
        }
        const where = filters.length ? { AND: filters } : {};
        const take = (_a = query.limit) !== null && _a !== void 0 ? _a : 25;
        const pois = await this.prisma.poi.findMany({
            where,
            include: { opening_hours: true },
            orderBy: { rating: 'desc' },
            take,
        });
        const results = pois.map((poi) => {
            const open_now = openContext ? this.isOpenNow(poi.opening_hours, openContext) : undefined;
            const distance_km = bboxCenter ? this.distanceKm(bboxCenter.lat, bboxCenter.lon, poi.latitude, poi.longitude) : undefined;
            return {
                id: poi.id,
                name: poi.name,
                lat: poi.latitude,
                lon: poi.longitude,
                rating: poi.rating,
                price_level: poi.price_level,
                distance_km,
                open_now,
            };
        });
        return { results };
    }
    async importCsv(buffer) {
        if (!(buffer === null || buffer === void 0 ? void 0 : buffer.length)) {
            throw new common_1.BadRequestException('CSV payload required');
        }
        const rows = (0, sync_1.parse)(buffer, { columns: true, skip_empty_lines: true, trim: true });
        const existingSlugs = new Set((await this.prisma.poi.findMany({ select: { slug: true } })).map((poi) => poi.slug));
        const categoryCache = new Map();
        const tagCache = new Map();
        const report = { created: 0, updated: 0, failed: 0, errors: [] };
        for (const row of rows) {
            try {
                const normalized = this.normalizeRow(row, existingSlugs);
                await this.prisma.$transaction(async (tx) => {
                    const poiExists = await tx.poi.findUnique({ where: { id: normalized.id } });
                    const { category, tags, opening_hours, created_at, updated_at, id: poiId, ...poiData } = normalized;
                    const createData = { ...poiData, id: poiId, created_at, updated_at };
                    const updateData = { ...poiData, updated_at: new Date() };
                    const poi = await tx.poi.upsert({
                        where: { id: poiId },
                        update: updateData,
                        create: createData,
                    });
                    await tx.openingHour.deleteMany({ where: { poi_id: poi.id } });
                    await tx.poiCategory.deleteMany({ where: { poi_id: poi.id } });
                    await tx.poiTag.deleteMany({ where: { poi_id: poi.id } });
                    if (category) {
                        const categoryId = await this.ensureCategory(tx, category, categoryCache);
                        await tx.poiCategory.create({ data: { poi_id: poi.id, category_id: categoryId } });
                    }
                    for (const tagName of tags) {
                        const tagId = await this.ensureTag(tx, tagName, tagCache);
                        await tx.poiTag.create({ data: { poi_id: poi.id, tag_id: tagId } });
                    }
                    for (const hour of opening_hours) {
                        await tx.openingHour.create({ data: { ...hour, poi_id: poi.id } });
                    }
                    if (poiExists) {
                        report.updated += 1;
                    }
                    else {
                        report.created += 1;
                    }
                });
            }
            catch (err) {
                report.failed += 1;
                report.errors.push(err.message);
            }
        }
        return report;
    }
    normalizeRow(row, usedSlugs) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const id = ((_a = row.id) === null || _a === void 0 ? void 0 : _a.trim()) || (0, crypto_1.randomUUID)();
        if (!((_b = row.name) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new common_1.BadRequestException('Row missing name');
        }
        if (!row.latitude || !row.longitude) {
            throw new common_1.BadRequestException(`Row ${row.name} missing coordinates`);
        }
        const slug = this.makeUniqueSlug(row.slug || row.name, usedSlugs);
        const opening_hours = this.parseOpeningHours(row.opening_hours);
        const tags = ((_c = row.tags) !== null && _c !== void 0 ? _c : '')
            .split('|')
            .map((tag) => tag.trim())
            .filter(Boolean);
        return {
            id,
            name: row.name.trim(),
            description: (_e = (_d = row.description) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : null,
            address: (_g = (_f = row.address) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : null,
            locality: (_j = (_h = row.locality) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : null,
            city: (_l = (_k = row.city) === null || _k === void 0 ? void 0 : _k.trim()) !== null && _l !== void 0 ? _l : 'Mumbai',
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            rating: row.rating ? Number(row.rating) : null,
            price_level: row.price_level ? Number(row.price_level) : null,
            ticket_price_inr: row.ticket_price_inr ? Number(row.ticket_price_inr) : null,
            best_time_of_day: (_m = row.best_time_of_day) !== null && _m !== void 0 ? _m : null,
            indoor_outdoor: (_o = row.indoor_outdoor) !== null && _o !== void 0 ? _o : null,
            time_spent_min: row.time_spent_min ? Number(row.time_spent_min) : null,
            website_url: (_q = (_p = row.website_url) === null || _p === void 0 ? void 0 : _p.trim()) !== null && _q !== void 0 ? _q : null,
            phone: (_s = (_r = row.phone) === null || _r === void 0 ? void 0 : _r.trim()) !== null && _s !== void 0 ? _s : null,
            image_url: (_u = (_t = row.image_url) === null || _t === void 0 ? void 0 : _t.trim()) !== null && _u !== void 0 ? _u : null,
            slug,
            created_at: row.created_at ? new Date(row.created_at) : new Date(),
            updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
            category: (_w = (_v = row.category) === null || _v === void 0 ? void 0 : _v.trim()) !== null && _w !== void 0 ? _w : null,
            tags,
            opening_hours,
        };
    }
    makeUniqueSlug(value, used) {
        const base = this.slugify(value);
        let candidate = base;
        let i = 2;
        while (used.has(candidate)) {
            candidate = `${base}-${i++}`;
        }
        used.add(candidate);
        return candidate;
    }
    slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .trim() || 'poi';
    }
    parseOpeningHours(value) {
        if (!value) {
            return [];
        }
        try {
            const parsed = JSON.parse(value);
            const hours = [];
            for (const [dayKey, intervals] of Object.entries(parsed)) {
                const weekday = dayKey.slice(0, 3).toUpperCase();
                if (!['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(weekday)) {
                    continue;
                }
                for (const interval of intervals) {
                    if (!Array.isArray(interval) || interval.length !== 2)
                        continue;
                    hours.push({ day: weekday, open_time: interval[0], close_time: interval[1] });
                }
            }
            return hours;
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid opening_hours JSON');
        }
    }
    normalizeOpenAt(value) {
        if (!value)
            return null;
        const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
        const normalized = hasZone ? value : `${value}+05:30`;
        const date = new Date(normalized);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        const weekday = date
            .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
            .slice(0, 3)
            .toUpperCase();
        const time = date
            .toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
        return { weekday, time };
    }
    isOpenNow(hours, context) {
        return hours.some((hour) => hour.day === context.weekday && hour.open_time <= context.time && hour.close_time >= context.time);
    }
    distanceKm(lat1, lon1, lat2, lon2) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }
    async ensureCategory(tx, name, cache) {
        const slug = this.slugify(name);
        if (cache.has(slug)) {
            return cache.get(slug);
        }
        const category = await tx.category.upsert({
            where: { slug },
            update: { display_name: name },
            create: { id: (0, crypto_1.randomUUID)(), slug, display_name: name },
        });
        cache.set(slug, category.id);
        return category.id;
    }
    async ensureTag(tx, name, cache) {
        const slug = this.slugify(name);
        if (cache.has(slug)) {
            return cache.get(slug);
        }
        const tag = await tx.tag.upsert({
            where: { slug },
            update: { display_name: name },
            create: { id: (0, crypto_1.randomUUID)(), slug, display_name: name },
        });
        cache.set(slug, tag.id);
        return tag.id;
    }
};
exports.PoisService = PoisService;
exports.PoisService = PoisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PoisService);
//# sourceMappingURL=pois.service.js.map