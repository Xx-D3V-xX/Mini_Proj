import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const groupByArgs = Prisma.validator<Prisma.PoiGroupByArgs>()({
      by: ['category'],
      _avg: { rating: true },
      _count: { _all: true },
    });
    const [poiCount, itineraryCount, avgRatingByCategory] = await this.prisma.$transaction([
      this.prisma.poi.count(),
      this.prisma.itinerary.count(),
      this.prisma.poi.groupBy(groupByArgs),
    ]);
    return {
      poiCount,
      itineraryCount,
      categories: avgRatingByCategory.map((row) => ({
        category: row.category,
        avgRating: row._avg.rating,
        count: row._count._all,
      })),
    };
  }
}
