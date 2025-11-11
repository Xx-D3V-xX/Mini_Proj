import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
        poiCount: number;
        itineraryCount: number;
        categories: {
            slug: string;
            name: string;
            avgRating: number;
            count: number;
        }[];
    }>;
}
