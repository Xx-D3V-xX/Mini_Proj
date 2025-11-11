import { PrismaClient } from '@prisma/client';

export type WeatherSnapshot = {
  summary: string;
  temp_c: number;
  humidity: number;
  fetched_at: Date;
};

export class WeatherAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async get(lat: number, lon: number): Promise<WeatherSnapshot> {
    const existing = await this.prisma.weatherCache.findFirst({
      where: { lat, lon },
      orderBy: { ts: 'desc' },
    });
    if (existing) {
      const payload = (existing.payload as any) ?? {};
      return {
        summary: payload.summary ?? 'Clear',
        temp_c: payload.temp_c ?? 30,
        humidity: payload.humidity ?? 70,
        fetched_at: existing.ts,
      };
    }
    // Mock downstream provider
    return {
      summary: 'Pleasant skies',
      temp_c: 30,
      humidity: 68,
      fetched_at: new Date(),
    };
  }
}
