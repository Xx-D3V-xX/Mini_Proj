import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { CreatePoiDto, createPoiSchema } from './dto/create-poi.dto';
import { PoiQueryDto, poiQuerySchema } from './dto/query-poi.dto';
import { UpdatePoiDto, updatePoiSchema } from './dto/update-poi.dto';
import { PoisService } from './pois.service';

@ApiTags('pois')
@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(poiQuerySchema)) query: PoiQueryDto) {
    return this.poisService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poisService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(createPoiSchema)) dto: CreatePoiDto) {
    return this.poisService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updatePoiSchema)) dto: UpdatePoiDto) {
    return this.poisService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poisService.delete(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file?: Express.Multer.File, @Body('path') path?: string) {
    let buffer: Buffer | undefined;
    if (file) {
      buffer = file.buffer;
    } else if (path) {
      buffer = fs.readFileSync(path);
    }
    if (!buffer) {
      throw new Error('Provide CSV file or path');
    }
    return this.poisService.importCsv(buffer);
  }
}
