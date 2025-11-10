import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { PrismaModule } from '../prisma/prisma.module';
import { PoisController } from './pois.controller';
import { PoisService } from './pois.service';

@Module({
  imports: [PrismaModule, MulterModule.register({ storage: memoryStorage() })],
  controllers: [PoisController],
  providers: [PoisService],
  exports: [PoisService],
})
export class PoisModule {}
