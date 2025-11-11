import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { CreateItineraryDto, createItinerarySchema } from './dto/create-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

@ApiTags('itineraries')
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createItinerarySchema)) dto: CreateItineraryDto) {
    return this.itinerariesService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.itinerariesService.get(id);
  }
}
