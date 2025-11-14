import { PrismaService } from '../prisma/prisma.service';
import { SearchPoiDto } from './dto/query-poi.dto';
export declare class PoisService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPoiDetails(id: string): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        address: string;
        locality: string;
        city: string;
        latitude: number;
        longitude: number;
        rating: number;
        price_level: number;
        ticket_price_inr: number;
        best_time_of_day: import("@prisma/client/default").$Enums.TimeOfDay;
        indoor_outdoor: import("@prisma/client/default").$Enums.IndoorOutdoor;
        time_spent_min: number;
        website_url: string;
        phone: string;
        image_url: string;
        categories: {
            slug: string;
            name: string;
        }[];
        tags: {
            slug: string;
            name: string;
        }[];
        opening_hours: {
            day: import("@prisma/client/default").$Enums.Weekday;
            open_time: string;
            close_time: string;
        }[];
    }>;
    search(query: SearchPoiDto): Promise<{
        results: {
            id: string;
            name: string;
            lat: number;
            lon: number;
            rating: number;
            price_level: number;
            distance_km: number;
            open_now: boolean;
        }[];
    }>;
    importCsv(buffer: Buffer): Promise<{
        created: number;
        updated: number;
        failed: number;
        errors: string[];
    }>;
    private normalizeRow;
    private makeUniqueSlug;
    private slugify;
    private parseOpeningHours;
    private normalizeOpenAt;
    private isOpenNow;
    private distanceKm;
    private ensureCategory;
    private ensureTag;
}
