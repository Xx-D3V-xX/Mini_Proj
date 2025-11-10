import { AiClientService } from '../integrations/ai-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
export declare class ItinerariesService {
    private readonly prisma;
    private readonly aiClient;
    constructor(prisma: PrismaService, aiClient: AiClientService);
    generate(userId: string, dto: GenerateItineraryDto): Promise<{
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
    list(userId: string): Promise<{
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
    get(userId: string, id: string): Promise<{
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
