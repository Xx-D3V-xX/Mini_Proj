import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { ItinerariesService } from './itineraries.service';
export declare class ItinerariesController {
    private readonly itinerariesService;
    constructor(itinerariesService: ItinerariesService);
    generate(user: any, dto: GenerateItineraryDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        date: Date | null;
        user_id: string;
        title: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        total_distance_km: number | null;
        total_time_min: number | null;
    }>;
    list(user: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        date: Date | null;
        user_id: string;
        title: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        total_distance_km: number | null;
        total_time_min: number | null;
    }[]>;
    get(user: any, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        date: Date | null;
        user_id: string;
        title: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        total_distance_km: number | null;
        total_time_min: number | null;
    }>;
}
