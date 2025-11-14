import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItinerariesService } from './itineraries.service';
export declare class ItinerariesController {
    private readonly itinerariesService;
    constructor(itinerariesService: ItinerariesService);
    generate(dto: CreateItineraryDto): Promise<{
        id: string;
        title: string;
        date: Date;
        total_distance_km: number;
        total_time_min: number;
        items: {
            poi_id: string;
            start_time: Date;
            end_time: Date;
            leg_distance_km: number;
            leg_time_min: number;
            note: string;
        }[];
    }>;
    create(user: any, dto: CreateItineraryDto): Promise<{
        id: string;
        title: string;
        date: Date;
        total_distance_km: number;
        total_time_min: number;
        items: {
            poi_id: string;
            start_time: Date;
            end_time: Date;
            leg_distance_km: number;
            leg_time_min: number;
            note: string;
        }[];
    }>;
    list(user: any): Promise<{
        id: string;
        title: string;
        date: Date;
        created_at: any;
        updated_at: any;
        total_distance_km: number;
        total_time_min: number;
        items: {
            poi_id: string;
            name: string;
            start_time: Date;
            end_time: Date;
            distance_km: number;
            leg_distance_km: number;
            leg_time_min: number;
            note: string;
        }[];
    }[]>;
    get(id: string): Promise<{
        id: string;
        title: string;
        date: Date;
        created_at: any;
        updated_at: any;
        total_distance_km: number;
        total_time_min: number;
        items: {
            poi_id: string;
            name: string;
            start_time: Date;
            end_time: Date;
            distance_km: number;
            leg_distance_km: number;
            leg_time_min: number;
            note: string;
        }[];
    }>;
}
