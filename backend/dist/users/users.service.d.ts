import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    me(userId: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client/default").$Enums.Role;
        preferences: Prisma.JsonValue;
    }>;
    updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<{
        id: string;
        email: string;
        preferences: Prisma.JsonValue;
    }>;
}
