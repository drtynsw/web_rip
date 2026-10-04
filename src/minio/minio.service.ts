import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'attack-vectors');
    const endPoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(this.config.get<string>('MINIO_PORT', '9000'));
    const useSSL = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.client = new Minio.Client({
      endPoint, port, useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.publicUrl = `${useSSL ? 'https' : 'http'}://${endPoint}:${port}/${this.bucket}`;
  }

  async onModuleInit() {
    try {
      if (!(await this.client.bucketExists(this.bucket))) {
        await this.client.makeBucket(this.bucket);
      }
      await this.client.setBucketPolicy(this.bucket, JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`] }],
      }));
    } catch (err) {
      this.logger.warn(`MinIO недоступен: ${err.message}`);
    }
  }

  async upload(objectName: string, data: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, objectName, data, data.length, { 'Content-Type': contentType });
  }

  getUrl(objectName: string): string {
    return `${this.publicUrl}/${objectName}`;
  }
}
