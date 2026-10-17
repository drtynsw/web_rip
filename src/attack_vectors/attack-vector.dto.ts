import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadedFile } from '../common/uploaded-file';

export class ListQuery {
  @ApiPropertyOptional({ example: 1999, description: 'Фильтр: год первой массовой фиксации' })
  discovered_year?: string;
}

export class FeedQuery {
  @ApiPropertyOptional({ example: 1, description: 'id услуги; без id — первая услуга ленты' })
  id?: string;

  @ApiPropertyOptional({ example: 'true', description: 'true — следующая услуга после id' })
  next?: string;
}

export class CreateRequest {
  @ApiProperty({ example: 'Атака посредника (MITM)' })
  title: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Файл изображения' })
  image: UploadedFile;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Файл короткого видео' })
  video: UploadedFile;
}

export class PublishRequest {
  @ApiProperty({ example: 'Перехват и подмена трафика между двумя сторонами' })
  short_description: string;

  @ApiProperty({ example: 7, minimum: 1, maximum: 10, description: 'Базовая опасность вектора атаки' })
  severity: number;

  @ApiProperty({ example: 2010, description: 'Год первой массовой фиксации' })
  discovered_year: number;
}

export class LikeRequest {
  @ApiProperty({ enum: [0, 1], example: 1 })
  like: 0 | 1;
}
