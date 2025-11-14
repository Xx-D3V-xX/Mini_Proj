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
      select: { id: true, name: true, latitude: true, longitude: true },
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
      include: {
        items: true,
      },
    });

    // Shape response for frontend expectations
    return {
      id: created.id,
      title: created.title,
      date: created.date,
      total_distance_km: created.total_distance_km ?? Number(totalDistance.toFixed(2)),
      total_time_min: created.total_time_min ?? Math.round(totalTime),
      items: created.items.map((it) => ({
        poi_id: it.poi_id,
        start_time: it.start_time,
        end_time: it.end_time,
        leg_distance_km: it.leg_distance_km,
        leg_time_min: it.leg_time_min,
        note: it.note,
      })),
    };
  }

  async get(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order_index: 'asc' },
          include: { poi: { select: { name: true } } },
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
      created_at: (itinerary as any).created_at ?? undefined,
      updated_at: (itinerary as any).updated_at ?? undefined,
      total_distance_km: itinerary.total_distance_km ?? undefined,
      total_time_min: itinerary.total_time_min ?? undefined,
      items: itinerary.items.map((it) => ({
        poi_id: it.poi_id,
        name: it.poi?.name,
        start_time: it.start_time,
        end_time: it.end_time,
        distance_km: it.leg_distance_km,
        leg_distance_km: it.leg_distance_km,
        leg_time_min: it.leg_time_min,
        note: it.note,
      })),
    };
  }

  async list(userId: string) {
    const itineraries = await this.prisma.itinerary.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        items: {
          orderBy: { order_index: 'asc' },
          include: { poi: { select: { name: true } } },
        },
      },
    });
    return itineraries.map((it) => ({
      id: it.id,
      title: it.title,
      date: it.date,
      created_at: (it as any).created_at ?? undefined,
      updated_at: (it as any).updated_at ?? undefined,
      total_distance_km: it.total_distance_km ?? undefined,
      total_time_min: it.total_time_min ?? undefined,
      items: it.items.map((item) => ({
        poi_id: item.poi_id,
        name: item.poi?.name,
        start_time: item.start_time,
        end_time: item.end_time,
        distance_km: item.leg_distance_km,
        leg_distance_km: item.leg_distance_km,
        leg_time_min: item.leg_time_min,
        note: item.note,
      })),
    }));
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
