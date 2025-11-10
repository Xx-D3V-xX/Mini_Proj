import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
export declare class AppConfigService {
    private readonly config;
    constructor(config: ConfigService);
    get port(): number;
    get corsOrigin(): string;
    get useAuthCookies(): boolean;
    get aiBaseUrl(): string;
    cookieOptions(): {
        httpOnly: boolean;
        sameSite: "lax";
        secure: boolean;
    };
    corsOptions(): CorsOptions;
}
export declare class AppConfigModule {
}
