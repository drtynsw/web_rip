import { Module } from '@nestjs/common';
import { VectorsController } from './attack_vectors.controller';
import { VectorsService } from './attack_vectors.service';

@Module({
  controllers: [VectorsController],
  providers: [VectorsService],
  exports: [VectorsService],
})
export class VectorsModule {}
