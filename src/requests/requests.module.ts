import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { VectorsModule } from '../vectors/vectors.module';

@Module({
  imports: [VectorsModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
