import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VectorsModule } from './attack_vectors/attack_vectors.module';
import { MinioModule } from './minio/minio.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MinioModule,
    MediaModule,
    VectorsModule,
  ],
})
export class AppModule {}
