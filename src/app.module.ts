import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VectorsModule } from './vectors/vectors.module';
import { RequestsModule } from './requests/requests.module';
import { HomeController } from './home.controller';
import { MinioModule } from './minio/minio.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MinioModule,
    ImagesModule,
    VectorsModule,
    RequestsModule,
  ],
  controllers: [HomeController],
})
export class AppModule {}
