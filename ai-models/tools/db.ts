import { Prisma, PrismaClient, Weekday } from '@prisma/client';

export type SearchFilters = {
  q?: string;
  category?: string;
  tag?: string;
  bbox?: [number, number, number, number];
  min_rating?: number;
  max_price?: number;
  open_at?: { weekday: Weekday; time: string };
};

export async function findPoiById(prisma: PrismaClient, id: string) {
  return prisma.poi.findUnique({
    where: { id },
    include: {
      opening_hours: true,
      category_links: { include: { category: true } },
      tag_links: { include: { tag: true } },
    },
  });
}

export async function searchPois(prisma: PrismaClient, filters: SearchFilters, limit = 12) {
  const where: Prisma.PoiWhereInput = {};
  const andFilters: Prisma.PoiWhereInput[] = [];

  if (filters.q) {
    const term = filters.q.trim();
    andFilters.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    });
  }
  if (filters.category) {
    andFilters.push({ category_links: { some: { category: { slug: filters.category } } } });
  }
  if (filters.tag) {
    andFilters.push({ tag_links: { some: { tag: { slug: filters.tag } } } });
  }
  if (filters.min_rating !== undefined) {
    andFilters.push({ rating: { gte: filters.min_rating } });
  }
  if (filters.max_price !== undefined) {
    andFilters.push({ price_level: { lte: filters.max_price } });
  }
  if (filters.bbox) {
    const [minLat, minLon, maxLat, maxLon] = filters.bbox;
    andFilters.push({
      latitude: { gte: Math.min(minLat, maxLat), lte: Math.max(minLat, maxLat) },
      longitude: { gte: Math.min(minLon, maxLon), lte: Math.max(minLon, maxLon) },
    });
  }
  if (filters.open_at) {
    andFilters.push({
      opening_hours: {
        some: {
          day: filters.open_at.weekday,
          open_time: { lte: filters.open_at.time },
          close_time: { gte: filters.open_at.time },
        },
      },
    });
  }
  if (andFilters.length) {
    where.AND = andFilters;
  }

  return prisma.poi.findMany({
    where,
    include: { opening_hours: true },
    orderBy: { rating: 'desc' },
    take: limit,
  });
}
