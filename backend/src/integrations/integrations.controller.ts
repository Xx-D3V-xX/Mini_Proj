import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiClientService } from './ai-client.service';
import { WeatherClientService } from './weather-client.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly weatherClient: WeatherClientService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('recommend')
  async recommend(@Body() payload: any) {
    // Try external AI service first
    try {
      return await this.aiClient.recommend(payload);
    } catch (err) {
      // Fallback: simple DB-based recommendation when AI service is unavailable or returns errors
      const mood: string = (payload?.mood || '').toString().toLowerCase();
      const moodTagMap: Record<string, string[]> = {
        chill: ['sunset', 'seaside', 'cafe', 'family'],
        foodie: ['food', 'dessert', 'street-food'],
        adventure: ['outdoor', 'trek', 'viewpoint'],
        romantic: ['sunset', 'seaside', 'viewpoint'],
        family: ['family', 'museum', 'park'],
      };
      const tags = moodTagMap[mood] || [];
      const where = tags.length
        ? { tag_links: { some: { tag: { slug: { in: tags } } } } }
        : {};
      const pois = await this.prisma.poi.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: 10,
        select: { id: true, name: true, latitude: true, longitude: true, rating: true, price_level: true },
      });
      // If still empty, return top-rated regardless of tags
      const finalPois = pois.length
        ? pois
        : await this.prisma.poi.findMany({
            orderBy: { rating: 'desc' },
            take: 10,
            select: { id: true, name: true, latitude: true, longitude: true, rating: true, price_level: true },
          });
      return {
        pois: finalPois.map((p) => ({
          id: p.id,
          name: p.name,
          lat: p.latitude,
          lon: p.longitude,
          rating: p.rating ?? 0,
          price_level: p.price_level ?? 0,
        })),
      };
    }
  }

  @Post('chat')
  chat(@Body() payload: any) {
    return this.aiClient.chat(payload);
  }

  @Post('travel-time')
  travelTime(@Body() payload: any) {
    return this.aiClient.travelTime(payload);
  }

  @Get('weather')
  weather() {
    return this.weatherClient.current();
  }
}
