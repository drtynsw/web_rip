import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MinioService } from '../minio/minio.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly minioService: MinioService) {}

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stat = await this.minioService.statObject(filename);
      const stream = await this.minioService.getObjectStream(filename);

      res.setHeader(
        'Content-Type',
        stat.metaData?.['content-type'] || 'application/octet-stream',
      );
      res.setHeader('Cache-Control', 'public, max-age=86400');

      stream.on('error', () => res.destroy());
      stream.pipe(res);
    } catch (err) {
      throw new NotFoundException(
        `Изображение "${filename}" не найдено в хранилище MinIO`,
      );
    }
  }
}
