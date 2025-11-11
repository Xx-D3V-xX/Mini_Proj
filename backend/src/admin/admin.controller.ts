import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { PoisService } from '../pois/pois.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly poisService: PoisService) {}

  @ApiConsumes('multipart/form-data')
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('CSV file is required');
    }
    return this.poisService.importCsv(file.buffer);
  }
}
