import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

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
        .filter((value): value is number => typeof value === 'number');
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
}
