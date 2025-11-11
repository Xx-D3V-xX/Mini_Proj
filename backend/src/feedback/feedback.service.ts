import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    const [user, poi] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.user_id }, select: { id: true } }),
      this.prisma.poi.findUnique({ where: { id: dto.poi_id }, select: { id: true } }),
    ]);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!poi) {
      throw new NotFoundException('POI not found');
    }
    await this.prisma.feedback.create({
      data: {
        user_id: dto.user_id,
        poi_id: dto.poi_id,
        signal: dto.signal,
        reason: dto.reason ?? null,
      },
    });
  }
}
