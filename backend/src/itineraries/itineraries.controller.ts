import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { CreateItineraryDto, createItinerarySchema } from './dto/create-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

@ApiTags('itineraries')
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  // Public endpoint used by the frontend and API.http for AI-assisted generation.
  // This intentionally does NOT require auth so we can fall back to a guest user
  // inside the service when no user_id is provided.
  @Post('generate')
  generate(@Body(new ZodValidationPipe(createItinerarySchema)) dto: CreateItineraryDto) {
    return this.itinerariesService.create(dto);
  }

  // Authenticated endpoint for creating itineraries tied to the logged-in user.
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body(new ZodValidationPipe(createItinerarySchema)) dto: CreateItineraryDto) {
    const enriched = { ...dto, user_id: user?.userId ?? dto.user_id } as CreateItineraryDto;
    return this.itinerariesService.create(enriched);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: any) {
    return this.itinerariesService.list(user.userId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.itinerariesService.get(id);
  }
}
