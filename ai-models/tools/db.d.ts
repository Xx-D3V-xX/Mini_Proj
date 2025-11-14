import { Prisma, PrismaClient, Weekday } from '@prisma/client';
export type SearchFilters = {
    q?: string;
    category?: string;
    tag?: string;
    bbox?: [number, number, number, number];
    min_rating?: number;
    max_price?: number;
    open_at?: {
        weekday: Weekday;
        time: string;
    };
};
export declare function findPoiById(prisma: PrismaClient, id: string): Promise<{
    opening_hours: {
        poi_id: string;
        day: import("@prisma/client/default").$Enums.Weekday;
        open_time: string;
        close_time: string;
    }[];
    category_links: ({
        category: {
            id: string;
            slug: string;
            display_name: string;
        };
    } & {
        poi_id: string;
        category_id: string;
    })[];
    tag_links: ({
        tag: {
            id: string;
            slug: string;
            display_name: string;
        };
    } & {
        poi_id: string;
        tag_id: string;
    })[];
} & {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    address: string | null;
    locality: string | null;
    city: string | null;
    latitude: number;
    longitude: number;
    rating: number | null;
    price_level: number | null;
    ticket_price_inr: number | null;
    best_time_of_day: import("@prisma/client/default").$Enums.TimeOfDay | null;
    indoor_outdoor: import("@prisma/client/default").$Enums.IndoorOutdoor | null;
    time_spent_min: number | null;
    website_url: string | null;
    phone: string | null;
    image_url: string | null;
    embedding: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
}>;
export declare function searchPois(prisma: PrismaClient, filters: SearchFilters, limit?: number): Promise<({
    opening_hours: {
        poi_id: string;
        day: import("@prisma/client/default").$Enums.Weekday;
        open_time: string;
        close_time: string;
    }[];
} & {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    address: string | null;
    locality: string | null;
    city: string | null;
    latitude: number;
    longitude: number;
    rating: number | null;
    price_level: number | null;
    ticket_price_inr: number | null;
    best_time_of_day: import("@prisma/client/default").$Enums.TimeOfDay | null;
    indoor_outdoor: import("@prisma/client/default").$Enums.IndoorOutdoor | null;
    time_spent_min: number | null;
    website_url: string | null;
    phone: string | null;
    image_url: string | null;
    embedding: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
})[]>;
