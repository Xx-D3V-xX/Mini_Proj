import { Global, Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return Number(this.config.get('PORT') ?? 4000);
  }

  get corsOrigin(): string {
    return this.config.get('CORS_ORIGIN') ?? 'http://localhost:5173';
  }

  get useAuthCookies(): boolean {
    return (this.config.get('USE_AUTH_COOKIES') ?? 'true') === 'true';
  }

  get aiBaseUrl(): string {
    return this.config.get('AI_BASE_URL') ?? 'http://localhost:8001';
  }

  cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: false,
    };
  }

  corsOptions(): CorsOptions {
    return {
      origin: this.corsOrigin,
      credentials: this.useAuthCookies,
    };
  }
}

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
