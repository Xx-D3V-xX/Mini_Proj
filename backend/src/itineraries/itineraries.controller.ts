import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { GenerateItineraryDto, generateItinerarySchema } from './dto/generate-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

@ApiTags('itineraries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post('generate')
  generate(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(generateItinerarySchema)) dto: GenerateItineraryDto,
  ) {
    return this.itinerariesService.generate(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.itinerariesService.list(user.userId);
  }

  @Get(':id')
  get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.itinerariesService.get(user.userId, id);
  }
}
