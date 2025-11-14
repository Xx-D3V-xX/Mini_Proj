import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
export declare class ItinerariesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateItineraryDto): Promise<{
        id: string;
        share_token: string;
    }>;
    get(id: string): Promise<{
        id: string;
        title: string;
        date: Date;
        items: {
            poi_id: string;
            start_time: Date;
            end_time: Date;
            note: string;
            leg_distance_km: number;
            leg_time_min: number;
        }[];
    }>;
    private buildItineraryItems;
    private parseDate;
    private distanceKm;
    private generateShareToken;
    private ensureGuestUser;
}
