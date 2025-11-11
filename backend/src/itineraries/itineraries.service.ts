import { Injectable, NotFoundException } from '@nestjs/common';
import { TravelMode } from '@prisma/client';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';

const SPEED_KMH: Record<TravelMode, number> = {
  WALK: 4,
  METRO: 34,
  BUS: 18,
  CAR: 26,
  AUTO: 20,
  MIXED: 12,
};

@Injectable()
export class ItinerariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItineraryDto) {
    const userId = dto.user_id ?? (await this.ensureGuestUser()).id;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const poiIds = dto.items.map((item) => item.poi_id);
    const pois = await this.prisma.poi.findMany({
      where: { id: { in: poiIds } },
      select: { id: true, latitude: true, longitude: true },
    });
    const poiMap = new Map(pois.map((poi) => [poi.id, poi]));
    for (const poiId of poiIds) {
      if (!poiMap.has(poiId)) {
        throw new NotFoundException(`POI ${poiId} not found`);
      }
    }

    const mode: TravelMode = dto.mode ?? TravelMode.MIXED;
    const itineraryItems = this.buildItineraryItems(dto.items, poiMap, mode);
    const totalDistance = itineraryItems.reduce((sum, item) => sum + (item.leg_distance_km ?? 0), 0);
    const totalTime = itineraryItems.reduce((sum, item) => sum + (item.leg_time_min ?? 0), 0);

    const created = await this.prisma.itinerary.create({
      data: {
        user_id: userId,
        title: dto.title,
        date: dto.date ? new Date(dto.date) : null,
        share_token: this.generateShareToken(),
        total_distance_km: Number(totalDistance.toFixed(2)),
        total_time_min: Math.round(totalTime),
        items: {
          create: itineraryItems.map((item, index) => ({
            order_index: index,
            poi_id: item.poi_id,
            start_time: item.start_time,
            end_time: item.end_time,
            leg_distance_km: item.leg_distance_km,
            leg_time_min: item.leg_time_min,
            note: item.note ?? null,
          })),
        },
      },
      select: { id: true, share_token: true },
    });

    return created;
  }

  async get(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order_index: 'asc' },
          select: {
            poi_id: true,
            start_time: true,
            end_time: true,
            leg_distance_km: true,
            leg_time_min: true,
            note: true,
          },
        },
      },
    });
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }
    return {
      id: itinerary.id,
      title: itinerary.title,
      date: itinerary.date,
      items: itinerary.items,
    };
  }

  private buildItineraryItems(
    items: CreateItineraryDto['items'],
    poiMap: Map<string, { id: string; latitude: number; longitude: number }>,
    mode: TravelMode,
  ) {
    const speed = SPEED_KMH[mode] ?? SPEED_KMH.MIXED;
    const parsed = items.map((item) => ({
      poi_id: item.poi_id,
      start_time: this.parseDate(item.start_time),
      end_time: this.parseDate(item.end_time),
      note: item.note,
      leg_distance_km: 0,
      leg_time_min: 0,
    }));

    for (let i = 1; i < parsed.length; i += 1) {
      const prevPoi = poiMap.get(parsed[i - 1].poi_id)!;
      const currentPoi = poiMap.get(parsed[i].poi_id)!;
      const distance = this.distanceKm(prevPoi.latitude, prevPoi.longitude, currentPoi.latitude, currentPoi.longitude);
      parsed[i].leg_distance_km = Number(distance.toFixed(2));
      parsed[i].leg_time_min = Math.max(1, Math.round((distance / speed) * 60));
    }

    return parsed;
  }

  private parseDate(value?: string) {
    if (!value) return null;
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
    const normalized = hasZone ? value : `${value}+05:30`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private generateShareToken() {
    return randomBytes(8).toString('hex');
  }

  private async ensureGuestUser() {
    return this.prisma.user.upsert({
      where: { email: 'guest@mumbai-trails.local' },
      update: {},
      create: {
        email: 'guest@mumbai-trails.local',
        password_hash: 'guest',
        name: 'Guest',
        role: 'USER',
      },
    });
  }
}
