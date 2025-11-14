import { Response } from 'express';
import { AppConfigService } from '../common/config';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, SignupDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly appConfig;
    constructor(authService: AuthService, appConfig: AppConfigService);
    signup(dto: SignupDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client/default").$Enums.Role;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client/default").$Enums.Role;
        };
    }>;
    refresh(dto: RefreshDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client/default").$Enums.Role;
        };
    }>;
    logout(res: Response): Promise<{
        success: boolean;
    }>;
    private attachCookies;
}
