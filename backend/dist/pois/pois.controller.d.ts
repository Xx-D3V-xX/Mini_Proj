import { CreatePoiDto } from './dto/create-poi.dto';
import { PoiQueryDto } from './dto/query-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { PoisService } from './pois.service';
export declare class PoisController {
    private readonly poisService;
    constructor(poisService: PoisService);
    findAll(query: PoiQueryDto): Promise<{
        items: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            category: string;
            tags: string[];
            price_level: number | null;
            description: string;
            latitude: number;
            longitude: number;
            rating: number | null;
            opening_hours: import("@prisma/client/runtime/library").JsonValue | null;
            image_url: string | null;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        category: string;
        tags: string[];
        price_level: number | null;
        description: string;
        latitude: number;
        longitude: number;
        rating: number | null;
        opening_hours: import("@prisma/client/runtime/library").JsonValue | null;
        image_url: string | null;
    }>;
    create(dto: CreatePoiDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        category: string;
        tags: string[];
        price_level: number | null;
        description: string;
        latitude: number;
        longitude: number;
        rating: number | null;
        opening_hours: import("@prisma/client/runtime/library").JsonValue | null;
        image_url: string | null;
    }>;
    update(id: string, dto: UpdatePoiDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        category: string;
        tags: string[];
        price_level: number | null;
        description: string;
        latitude: number;
        longitude: number;
        rating: number | null;
        opening_hours: import("@prisma/client/runtime/library").JsonValue | null;
        image_url: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    importCsv(file?: Express.Multer.File, path?: string): Promise<{
        imported: number;
    }>;
}
