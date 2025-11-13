import { PrismaClient } from '@prisma/client';
export type WeatherSnapshot = {
    summary: string;
    temp_c: number;
    humidity: number;
    fetched_at: Date;
};
export declare class WeatherAdapter {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    get(lat: number, lon: number): Promise<WeatherSnapshot>;
}
