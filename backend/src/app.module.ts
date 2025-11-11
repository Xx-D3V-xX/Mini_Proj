import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { AppConfigModule } from './common/config';
import { IntegrationsModule } from './integrations/integrations.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { PoisModule } from './pois/pois.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ChatModule } from './chat/chat.module';

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
    AdminModule,
    FeedbackModule,
    ChatModule,
  ],
})
export class AppModule {}
