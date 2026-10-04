import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query,
  UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttackVectorsService } from './attack_vectors.service';
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
  list(@Query('discovered_year') yearRaw?: string) {
    const year = toInt(yearRaw);
    if (Number.isNaN(year)) throw new BadRequestException();
    return this.service.findPublished(getCurrentUser().id, year);
  }

  @Get('feed')
  feed() {
    return this.service.findFeed(getCurrentUser().id);
  }

  @Get('feed/:id')
  feedById(@Param('id', ParseIntPipe) id: number, @Query('next') next?: string) {
    return this.service.findFeed(getCurrentUser().id, id, next === 'true');
  }

  @Get('draft')
  draft() {
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
  ) {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!title?.trim() || !image?.mimetype.startsWith('image/') || !video?.mimetype.startsWith('video/')) {
      throw new BadRequestException();
    }
    return this.service.createDraft(getCurrentUser().id, title.trim(), image, video);
  }

  @Put('draft/publish')
  publish(
    @Body('short_description') shortDescription?: string,
    @Body('severity') severityRaw?: unknown,
    @Body('discovered_year') yearRaw?: unknown,
  ) {
    const severity = toInt(severityRaw);
    const year = toInt(yearRaw);
    if (!shortDescription?.trim() || !severity || severity < 1 || severity > 10 || !year || year < 1900) {
      throw new BadRequestException();
    }
    return this.service.publishDraft(getCurrentUser().id, shortDescription.trim(), severity, year);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.softDelete(getCurrentUser().id, id);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(@Param('id', ParseIntPipe) id: number, @Body('like') likeRaw?: unknown) {
    const like = toInt(likeRaw);
    if (like !== 0 && like !== 1) throw new BadRequestException();
    return this.service.setLike(getCurrentUser().id, id, like);
  }
}
