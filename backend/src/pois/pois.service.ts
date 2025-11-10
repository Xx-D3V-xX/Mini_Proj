import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { parse } from 'csv-parse/sync';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePoiDto } from './dto/create-poi.dto';
import { PoiQueryDto } from './dto/query-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';

@Injectable()
export class PoisService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PoiQueryDto) {
    const take = 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * take;
    const where: Prisma.PoiWhereInput = {};

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

  async findOne(id: string) {
    const poi = await this.prisma.poi.findUnique({ where: { id } });
    if (!poi) {
      throw new NotFoundException('POI not found');
    }
    return poi;
  }

  async create(dto: CreatePoiDto) {
    return this.prisma.poi.create({
      data: {
        ...dto,
        opening_hours: (dto.opening_hours ?? Prisma.JsonNull) as Prisma.InputJsonValue | Prisma.JsonNullValueInput,
      },
    });
  }

  async update(id: string, dto: UpdatePoiDto) {
    await this.findOne(id);
    const data: Prisma.PoiUpdateInput = { ...dto } as Prisma.PoiUpdateInput;
    if (dto.opening_hours !== undefined) {
      data.opening_hours = (dto.opening_hours ?? Prisma.JsonNull) as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput;
    }
    return this.prisma.poi.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.poi.delete({ where: { id } });
    return { success: true };
  }

  async importCsv(buffer: Buffer) {
    const rows = parse<PoiCsvRow>(buffer, { columns: true, skip_empty_lines: true });
    const writes: PrismaPromise<any>[] = [];
    for (const row of rows) {
      const tags = (row.tags || '')
        .split('|')
        .map((tag: string) => tag.trim())
        .filter(Boolean);
      const opening_hours = this.safeJson(row.opening_hours);
      writes.push(
        this.prisma.poi.upsert({
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
            opening_hours: opening_hours ?? Prisma.JsonNull,
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
            opening_hours: opening_hours ?? Prisma.JsonNull,
            image_url: row.image_url,
          },
        }),
      );
    }
    await this.prisma.$transaction(writes);
    return { imported: rows.length };
  }

  private safeJson(value?: string | null): Prisma.InputJsonValue | null {
    try {
      return value ? (JSON.parse(value) as Prisma.InputJsonValue) : null;
    } catch (err) {
      return null;
    }
  }

  private resolveSort(sort?: string): Prisma.PoiOrderByWithRelationInput {
    if (!sort) return { created_at: Prisma.SortOrder.desc };
    switch (sort) {
      case 'rating_desc':
        return { rating: Prisma.SortOrder.desc };
      case 'rating_asc':
        return { rating: Prisma.SortOrder.asc };
      default:
        return { created_at: Prisma.SortOrder.desc };
    }
  }
}

type PoiCsvRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: string;
  longitude: string;
  rating?: string;
  price_level?: string;
  tags?: string;
  opening_hours?: string;
  image_url?: string;
};
