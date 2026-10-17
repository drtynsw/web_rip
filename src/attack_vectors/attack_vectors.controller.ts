import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query,
  UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttackVectorsService } from './attack_vectors.service';
import { AttackVectorResponse } from './attack-vector.serializer';
import { FeedQuery, LikeRequest, ListQuery, PublishRequest } from './attack-vector.dto';
import { getCurrentUser } from '../common/current-user';
import { UploadedFile } from '../common/uploaded-file';

const toInt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

@Controller('attack_vectors')
export class AttackVectorsController {
  constructor(private readonly service: AttackVectorsService) {}

  @Get()
  list(@Query() query: ListQuery): Promise<AttackVectorResponse[]> {
    const year = toInt(query.discovered_year);
    if (Number.isNaN(year)) throw new BadRequestException();
    return this.service.findPublished(getCurrentUser().id, year);
  }

  @Get('feed')
  feed(@Query() query: FeedQuery): Promise<AttackVectorResponse> {
    const id = toInt(query.id);
    if (Number.isNaN(id)) throw new BadRequestException();
    return this.service.findFeed(getCurrentUser().id, id, query.next === 'true');
  }

  @Get('draft')
  draft(): Promise<AttackVectorResponse> {
    return this.service.findDraft(getCurrentUser().id);
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }],
    { limits: { fileSize: 50 * 1024 * 1024 } }, // без dest файлы хранятся в памяти (buffer)
  ))
  create(
    @Body('title') title: string,
    @UploadedFiles() files: { image?: UploadedFile[]; video?: UploadedFile[] },
  ): Promise<AttackVectorResponse> {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!title?.trim() || !image?.mimetype.startsWith('image/') || !video?.mimetype.startsWith('video/')) {
      throw new BadRequestException();
    }
    return this.service.createDraft(getCurrentUser().id, { title: title.trim(), image, video });
  }

  @Put('draft/publish')
  publish(@Body() body: PublishRequest): Promise<AttackVectorResponse> {
    const severity = toInt(body?.severity);
    const year = toInt(body?.discovered_year);
    const text = body?.short_description?.trim();
    if (!text || !severity || severity < 1 || severity > 10 || !year || year < 1900) {
      throw new BadRequestException();
    }
    return this.service.publishDraft(getCurrentUser().id, { short_description: text, severity, discovered_year: year });
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.softDelete(getCurrentUser().id, id);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(@Param('id', ParseIntPipe) id: number, @Body() body: LikeRequest): Promise<AttackVectorResponse> {
    const like = toInt(body?.like);
    if (like !== 0 && like !== 1) throw new BadRequestException();
    return this.service.setLike(getCurrentUser().id, id, like);
  }
}
