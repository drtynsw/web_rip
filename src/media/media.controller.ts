import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MinioService } from '../minio/minio.service';

@Controller('media')
export class MediaController {
  constructor(private readonly minioService: MinioService) {}

  @Get(':filename')
  async getMedia(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stat = await this.minioService.statObject(filename);
      const stream = await this.minioService.getObjectStream(filename);

      res.setHeader(
        'Content-Type',
        stat.metaData?.['content-type'] || this.guessContentType(filename),
      );
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (stat.size) {
        res.setHeader('Content-Length', String(stat.size));
      }

      stream.on('error', () => res.destroy());
      stream.pipe(res);
    } catch (err) {
      throw new NotFoundException(
        `Файл "${filename}" не найден в хранилище MinIO`,
      );
    }
  }

  private guessContentType(filename: string): string {
    if (filename.endsWith('.mp4')) return 'video/mp4';
    if (filename.endsWith('.webm')) return 'video/webm';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.svg')) return 'image/svg+xml';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg'))
      return 'image/jpeg';
    return 'application/octet-stream';
  }
}
