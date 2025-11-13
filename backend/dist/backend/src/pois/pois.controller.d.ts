import { AdminPoiDto, PoisService } from './pois.service';
export declare class PoisController {
    private readonly poisService;
    constructor(poisService: PoisService);
    list(): Promise<{
        id: string;
        name: string;
        description: string;
        latitude: number;
        longitude: number;
        rating: number;
        price_level: number;
        image_url: string;
    }[]>;
    findOne(id: string): Promise<{
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
    create(dto: AdminPoiDto): Promise<{
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
    update(id: string, dto: AdminPoiDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
