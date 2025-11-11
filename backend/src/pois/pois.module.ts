import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PoisController } from './pois.controller';
import { PoiSearchController } from './search.controller';
import { PoisService } from './pois.service';

@Module({
  imports: [PrismaModule],
  controllers: [PoisController, PoiSearchController],
  providers: [PoisService],
  exports: [PoisService],
})
export class PoisModule {}
