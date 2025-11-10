import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiClientService } from './ai-client.service';
import { WeatherClientService } from './weather-client.service';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly weatherClient: WeatherClientService,
  ) {}

  @Post('recommend')
  recommend(@Body() payload: any) {
    return this.aiClient.recommend(payload);
  }

  @Post('chat')
  chat(@Body() payload: any) {
    return this.aiClient.chat(payload);
  }

  @Post('travel-time')
  travelTime(@Body() payload: any) {
    return this.aiClient.travelTime(payload);
  }

  @Get('weather')
  weather() {
    return this.weatherClient.current();
  }
}
