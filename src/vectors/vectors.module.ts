import { Module } from '@nestjs/common';
import { VectorsController } from './vectors.controller';
import { VectorsService } from './vectors.service';

@Module({
  controllers: [VectorsController],
  providers: [VectorsService],
  exports: [VectorsService],
})
export class VectorsModule {}
