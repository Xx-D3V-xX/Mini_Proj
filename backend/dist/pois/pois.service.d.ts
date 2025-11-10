import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoiDto } from './dto/create-poi.dto';
import { PoiQueryDto } from './dto/query-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
export declare class PoisService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            opening_hours: Prisma.JsonValue | null;
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
        opening_hours: Prisma.JsonValue | null;
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
        opening_hours: Prisma.JsonValue | null;
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
        opening_hours: Prisma.JsonValue | null;
        image_url: string | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    importCsv(buffer: Buffer): Promise<{
        imported: number;
    }>;
    private safeJson;
    private resolveSort;
}
