import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { PoisModule } from '../pois/pois.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [PoisModule, MulterModule.register({ storage: memoryStorage() })],
  controllers: [AdminController],
})
export class AdminModule {}
