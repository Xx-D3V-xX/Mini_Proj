import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: any): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("@prisma/client/default").$Enums.Role;
        preferences: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updatePreferences(user: any, dto: UpdatePreferencesDto): Promise<{
        id: string;
        email: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
