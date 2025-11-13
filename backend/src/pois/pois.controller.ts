import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminPoiDto, PoisService } from './pois.service';

@ApiTags('pois')
@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  // Public list endpoint so Admin and other clients can fetch POIs
  @Get()
  list() {
    return this.poisService.listPublic();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poisService.getPoiDetails(id);
  }

  // Admin-only CRUD endpoints
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: AdminPoiDto) {
    return this.poisService.createFromAdmin(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: AdminPoiDto) {
    return this.poisService.updateFromAdmin(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.poisService.deletePoi(id);
  }
}
