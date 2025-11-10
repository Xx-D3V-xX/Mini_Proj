import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
