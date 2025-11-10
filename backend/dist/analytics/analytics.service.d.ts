import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
        poiCount: number;
        itineraryCount: number;
        categories: {
            category: string;
            avgRating: number;
            count: number;
        }[];
    }>;
}
