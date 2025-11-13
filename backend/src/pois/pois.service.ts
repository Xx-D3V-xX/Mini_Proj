import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IndoorOutdoor, OpeningHour, Prisma, TimeOfDay, Weekday } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { SearchPoiDto } from './dto/query-poi.dto';

export type AdminPoiDto = {
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  price_level?: number | null;
  rating?: number | null;
  opening_hours?: string | null;
  tags?: string[];
  image_url?: string | null;
};

@Injectable()
export class PoisService {
  constructor(private readonly prisma: PrismaService) {}

  async getPoiDetails(id: string) {
    const poi = await this.prisma.poi.findUnique({
      where: { id },
      include: {
        opening_hours: true,
        category_links: { include: { category: true } },
        tag_links: { include: { tag: true } },
      },
    });
    if (!poi) {
      throw new NotFoundException('POI not found');
    }

    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const opening_hours = [...poi.opening_hours].sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
    );
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

  async search(query: SearchPoiDto) {
    const filters: Prisma.PoiWhereInput[] = [];
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
    let bboxCenter: { lat: number; lon: number } | undefined;
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
    } else if (query.weekday) {
      filters.push({ opening_hours: { some: { day: query.weekday as Weekday } } });
    }

    const where: Prisma.PoiWhereInput = filters.length ? { AND: filters } : {};
    const take = query.limit ?? 25;
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
        image_url: poi.image_url,
      };
    });

    return { results };
  }

  async listPublic(limit = 100) {
    const pois = await this.prisma.poi.findMany({
      orderBy: { rating: 'desc' },
      take: limit,
    });
    return pois.map((poi) => ({
      id: poi.id,
      name: poi.name,
      description: poi.description,
      latitude: poi.latitude,
      longitude: poi.longitude,
      rating: poi.rating,
      price_level: poi.price_level,
      image_url: poi.image_url,
    }));
  }

  async createFromAdmin(dto: AdminPoiDto) {
    const existingSlugs = new Set(
      (await this.prisma.poi.findMany({ select: { slug: true } })).map((poi) => poi.slug),
    );
    const row: ImportRow = {
      id: undefined,
      name: dto.name,
      description: dto.description,
      address: '',
      locality: '',
      city: 'Mumbai',
      latitude: String(dto.latitude),
      longitude: String(dto.longitude),
      rating: dto.rating != null ? String(dto.rating) : undefined,
      price_level: dto.price_level != null ? String(dto.price_level) : undefined,
      ticket_price_inr: undefined,
      best_time_of_day: undefined,
      indoor_outdoor: undefined,
      time_spent_min: undefined,
      website_url: dto.image_url ?? undefined,
      phone: undefined,
      image_url: dto.image_url ?? undefined,
      slug: undefined,
      tags: dto.tags?.join('|'),
      category: dto.category,
      opening_hours: dto.opening_hours ?? undefined,
      created_at: undefined,
      updated_at: undefined,
    };
    const normalized = this.normalizeRow(row, existingSlugs);
    const categoryCache = new Map<string, string>();
    const tagCache = new Map<string, string>();

    const poi = await this.prisma.$transaction(async (tx) => {
      const { category, tags, opening_hours, created_at, updated_at, id: poiId, ...poiData } = normalized;
      const createData = { ...poiData, id: poiId, created_at, updated_at };
      const updateData = { ...poiData, updated_at: new Date() };
      const created = await tx.poi.upsert({
        where: { id: poiId },
        update: updateData,
        create: createData,
      });

      await tx.openingHour.deleteMany({ where: { poi_id: created.id } });
      await tx.poiCategory.deleteMany({ where: { poi_id: created.id } });
      await tx.poiTag.deleteMany({ where: { poi_id: created.id } });

      if (category) {
        const categoryId = await this.ensureCategory(tx, category, categoryCache);
        await tx.poiCategory.create({ data: { poi_id: created.id, category_id: categoryId } });
      }
      for (const tagName of tags) {
        const tagId = await this.ensureTag(tx, tagName, tagCache);
        await tx.poiTag.create({ data: { poi_id: created.id, tag_id: tagId } });
      }
      for (const hour of opening_hours) {
        await tx.openingHour.create({ data: { ...hour, poi_id: created.id } });
      }

      return created;
    });

    return this.getPoiDetails(poi.id);
  }

  async updateFromAdmin(id: string, dto: AdminPoiDto) {
    const existing = await this.prisma.poi.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('POI not found');
    }
    const existingSlugs = new Set(
      (await this.prisma.poi.findMany({ select: { slug: true } })).map((poi) => poi.slug),
    );
    existingSlugs.delete(existing.slug);

    const row: ImportRow = {
      id,
      name: dto.name,
      description: dto.description,
      address: '',
      locality: '',
      city: 'Mumbai',
      latitude: String(dto.latitude),
      longitude: String(dto.longitude),
      rating: dto.rating != null ? String(dto.rating) : undefined,
      price_level: dto.price_level != null ? String(dto.price_level) : undefined,
      ticket_price_inr: undefined,
      best_time_of_day: undefined,
      indoor_outdoor: undefined,
      time_spent_min: undefined,
      website_url: dto.image_url ?? undefined,
      phone: undefined,
      image_url: dto.image_url ?? undefined,
      slug: existing.slug,
      tags: dto.tags?.join('|'),
      category: dto.category,
      opening_hours: dto.opening_hours ?? undefined,
      created_at: existing.created_at.toISOString(),
      updated_at: undefined,
    };
    const normalized = this.normalizeRow(row, existingSlugs);
    const categoryCache = new Map<string, string>();
    const tagCache = new Map<string, string>();

    const poi = await this.prisma.$transaction(async (tx) => {
      const { category, tags, opening_hours, created_at, updated_at, id: poiId, ...poiData } = normalized;
      const createData = { ...poiData, id: poiId, created_at, updated_at };
      const updateData = { ...poiData, updated_at: new Date() };
      const updated = await tx.poi.upsert({
        where: { id: poiId },
        update: updateData,
        create: createData,
      });

      await tx.openingHour.deleteMany({ where: { poi_id: updated.id } });
      await tx.poiCategory.deleteMany({ where: { poi_id: updated.id } });
      await tx.poiTag.deleteMany({ where: { poi_id: updated.id } });

      if (category) {
        const categoryId = await this.ensureCategory(tx, category, categoryCache);
        await tx.poiCategory.create({ data: { poi_id: updated.id, category_id: categoryId } });
      }
      for (const tagName of tags) {
        const tagId = await this.ensureTag(tx, tagName, tagCache);
        await tx.poiTag.create({ data: { poi_id: updated.id, tag_id: tagId } });
      }
      for (const hour of opening_hours) {
        await tx.openingHour.create({ data: { ...hour, poi_id: updated.id } });
      }

      return updated;
    });

    return this.getPoiDetails(poi.id);
  }

  async deletePoi(id: string) {
    const existing = await this.prisma.poi.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('POI not found');
    }
    await this.prisma.poi.delete({ where: { id } });
    return { success: true };
  }

  async importCsv(buffer: Buffer) {
    if (!buffer?.length) {
      throw new BadRequestException('CSV payload required');
    }
    const rows = parse<ImportRow>(buffer, { columns: true, skip_empty_lines: true, trim: true });
    const existingSlugs = new Set(
      (await this.prisma.poi.findMany({ select: { slug: true } })).map((poi) => poi.slug),
    );
    const categoryCache = new Map<string, string>();
    const tagCache = new Map<string, string>();
    const report = { created: 0, updated: 0, failed: 0, errors: [] as string[] };

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
          } else {
            report.created += 1;
          }
        });
      } catch (err) {
        report.failed += 1;
        report.errors.push((err as Error).message);
      }
    }

    return report;
  }

  private normalizeRow(row: ImportRow, usedSlugs: Set<string>): NormalizedRow {
    const id = row.id?.trim() || randomUUID();
    if (!row.name?.trim()) {
      throw new BadRequestException('Row missing name');
    }
    if (!row.latitude || !row.longitude) {
      throw new BadRequestException(`Row ${row.name} missing coordinates`);
    }
    const slug = this.makeUniqueSlug(row.slug || row.name, usedSlugs);
    const opening_hours = this.parseOpeningHours(row.opening_hours);
    const tags = (row.tags ?? '')
      .split('|')
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      id,
      name: row.name.trim(),
      description: row.description?.trim() ?? null,
      address: row.address?.trim() ?? null,
      locality: row.locality?.trim() ?? null,
      city: row.city?.trim() ?? 'Mumbai',
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      rating: row.rating ? Number(row.rating) : null,
      price_level: row.price_level ? Number(row.price_level) : null,
      ticket_price_inr: row.ticket_price_inr ? Number(row.ticket_price_inr) : null,
      best_time_of_day: (row.best_time_of_day as TimeOfDay | undefined) ?? null,
      indoor_outdoor: (row.indoor_outdoor as IndoorOutdoor | undefined) ?? null,
      time_spent_min: row.time_spent_min ? Number(row.time_spent_min) : null,
      website_url: row.website_url?.trim() ?? null,
      phone: row.phone?.trim() ?? null,
      image_url: row.image_url?.trim() ?? null,
      slug,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
      category: row.category?.trim() ?? null,
      tags,
      opening_hours,
    };
  }

  private makeUniqueSlug(value: string, used: Set<string>) {
    const base = this.slugify(value);
    let candidate = base;
    let i = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${i++}`;
    }
    used.add(candidate);
    return candidate;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim() || 'poi';
  }

  private parseOpeningHours(value?: string | null) {
    if (!value) {
      return [] as OpeningHourInput[];
    }
    try {
      const parsed = JSON.parse(value) as Record<string, [string, string][]>;
      const hours: OpeningHourInput[] = [];
      for (const [dayKey, intervals] of Object.entries(parsed)) {
        const weekday = dayKey.slice(0, 3).toUpperCase();
        if (!['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(weekday)) {
          continue;
        }
        for (const interval of intervals) {
          if (!Array.isArray(interval) || interval.length !== 2) continue;
          hours.push({ day: weekday as Weekday, open_time: interval[0], close_time: interval[1] });
        }
      }
      return hours;
    } catch (err) {
      throw new BadRequestException('Invalid opening_hours JSON');
    }
  }

  private normalizeOpenAt(value?: string) {
    if (!value) return null;
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
    const normalized = hasZone ? value : `${value}+05:30`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const weekday = date
      .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
      .slice(0, 3)
      .toUpperCase() as Weekday;
    const time = date
      .toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    return { weekday, time } as { weekday: Weekday; time: string };
  }

  private isOpenNow(hours: OpeningHour[], context: { weekday: Weekday; time: string }) {
    return hours.some(
      (hour) =>
        hour.day === context.weekday && hour.open_time <= context.time && hour.close_time >= context.time,
    );
  }

  private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private async ensureCategory(
    tx: Prisma.TransactionClient,
    name: string,
    cache: Map<string, string>,
  ) {
    const slug = this.slugify(name);
    if (cache.has(slug)) {
      return cache.get(slug)!;
    }
    const category = await tx.category.upsert({
      where: { slug },
      update: { display_name: name },
      create: { id: randomUUID(), slug, display_name: name },
    });
    cache.set(slug, category.id);
    return category.id;
  }

  private async ensureTag(tx: Prisma.TransactionClient, name: string, cache: Map<string, string>) {
    const slug = this.slugify(name);
    if (cache.has(slug)) {
      return cache.get(slug)!;
    }
    const tag = await tx.tag.upsert({
      where: { slug },
      update: { display_name: name },
      create: { id: randomUUID(), slug, display_name: name },
    });
    cache.set(slug, tag.id);
    return tag.id;
  }
}

type ImportRow = {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  locality?: string;
  city?: string;
  latitude: string;
  longitude: string;
  rating?: string;
  price_level?: string;
  ticket_price_inr?: string;
  best_time_of_day?: string;
  indoor_outdoor?: string;
  time_spent_min?: string;
  website_url?: string;
  phone?: string;
  image_url?: string;
  slug?: string;
  tags?: string;
  category?: string;
  opening_hours?: string;
  created_at?: string;
  updated_at?: string;
};

type OpeningHourInput = {
  poi_id?: string;
  day: Weekday;
  open_time: string;
  close_time: string;
};

type NormalizedRow = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  locality: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  price_level: number | null;
  ticket_price_inr: number | null;
  best_time_of_day: TimeOfDay | null;
  indoor_outdoor: IndoorOutdoor | null;
  time_spent_min: number | null;
  website_url: string | null;
  phone: string | null;
  image_url: string | null;
  slug: string;
  created_at: Date;
  updated_at: Date;
  category: string | null;
  tags: string[];
  opening_hours: OpeningHourInput[];
};
