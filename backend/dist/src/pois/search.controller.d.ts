import { SearchPoiDto } from './dto/query-poi.dto';
import { PoisService } from './pois.service';
export declare class PoiSearchController {
    private readonly poisService;
    constructor(poisService: PoisService);
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
}
