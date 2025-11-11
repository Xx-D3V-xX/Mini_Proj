import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { searchPoiSchema, SearchPoiDto } from './dto/query-poi.dto';
import { PoisService } from './pois.service';

@ApiTags('search')
@Controller('search')
export class PoiSearchController {
  constructor(private readonly poisService: PoisService) {}

  @Get()
  search(@Query(new ZodValidationPipe(searchPoiSchema)) query: SearchPoiDto) {
    return this.poisService.search(query);
  }
}
