import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalyticsModule } from './analytics/analytics.module';
import { AppConfigModule } from './common/config';
import { IntegrationsModule } from './integrations/integrations.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { PoisModule } from './pois/pois.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PoisModule,
    ItinerariesModule,
    UploadsModule,
    AnalyticsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
