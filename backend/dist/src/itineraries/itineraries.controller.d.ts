import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItinerariesService } from './itineraries.service';
export declare class ItinerariesController {
    private readonly itinerariesService;
    constructor(itinerariesService: ItinerariesService);
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
}
