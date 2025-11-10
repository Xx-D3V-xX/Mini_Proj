import { Injectable, NotFoundException } from '@nestjs/common';

import { AiClientService } from '../integrations/ai-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';

@Injectable()
export class ItinerariesService {
  constructor(private readonly prisma: PrismaService, private readonly aiClient: AiClientService) {}

  async generate(userId: string, dto: GenerateItineraryDto) {
    const aiPlan = await this.aiClient.itinerary({
      mood: dto.mood,
      start_location: dto.start_location,
      time_window: dto.time_window,
      poi_ids: dto.poi_ids,
    });
    const itinerary = await this.prisma.itinerary.create({
      data: {
        user_id: userId,
        title: aiPlan.title ?? `${dto.mood} Trail`,
        items: aiPlan.items,
        total_distance_km: aiPlan.total_distance_km,
        total_time_min: aiPlan.total_time_min,
      },
    });
    return itinerary;
  }

  async list(userId: string) {
    return this.prisma.itinerary.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const itinerary = await this.prisma.itinerary.findFirst({ where: { id, user_id: userId } });
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }
    return itinerary;
  }
}
