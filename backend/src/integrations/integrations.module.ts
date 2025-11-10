import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigModule } from '../common/config';
import { AiClientService } from './ai-client.service';
import { IntegrationsController } from './integrations.controller';
import { WeatherClientService } from './weather-client.service';

@Module({
  imports: [ConfigModule, AppConfigModule],
  providers: [AiClientService, WeatherClientService],
  controllers: [IntegrationsController],
  exports: [AiClientService, WeatherClientService],
})
export class IntegrationsModule {}
