import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>(
      'MINIO_BUCKET',
      'vulnerability-images',
    );

    this.client = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.config.get<string>('MINIO_PORT', '9000')),
      useSSL: this.config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Бакет "${this.bucket}" создан`);
      } else {
        this.logger.log(`Подключение к MinIO установлено, бакет "${this.bucket}" найден`);
      }
    } catch (err) {
      this.logger.warn(
        `Не удалось подключиться к MinIO: ${err.message}. ` +
          `Проверьте, что контейнер MinIO запущен и переменные окружения верны.`,
      );
    }
  }

  getObjectStream(objectName: string) {
    return this.client.getObject(this.bucket, objectName);
  }

  statObject(objectName: string) {
    return this.client.statObject(this.bucket, objectName);
  }

  uploadFile(objectName: string, filePath: string, contentType?: string) {
    return this.client.fPutObject(
      this.bucket,
      objectName,
      filePath,
      contentType ? { 'Content-Type': contentType } : undefined,
    );
  }

  getPresignedUrl(objectName: string, expirySeconds = 3600) {
    return this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }
}
