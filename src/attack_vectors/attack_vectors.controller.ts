import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query,
  UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody, ApiConsumes, ApiCookieAuth, ApiOkResponse, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { AttackVectorsService } from './attack_vectors.service';
import { AttackVectorResponse } from './attack-vector.serializer';
import { CreateRequest, FeedQuery, LikeRequest, ListQuery, PublishRequest } from './attack-vector.dto';
import { AuthRequired, CurrentUser } from '../auth/auth.guard';
import { SessionUser } from '../session/session.service';
import { UploadedFile } from '../common/uploaded-file';

const toInt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

@ApiTags('Услуги — attack_vectors')
@Controller('attack_vectors')
export class AttackVectorsController {
  constructor(private readonly service: AttackVectorsService) {}

  @Get()
  @ApiOperation({ summary: '1. Список услуг с фильтрацией (только опубликованные)', description: 'Доступно гостю.' })
  @ApiOkResponse({ type: AttackVectorResponse, isArray: true })
  @ApiResponse({ status: 400, description: 'Неверный год' })
  list(@Query() query: ListQuery, @CurrentUser() user: SessionUser | null): Promise<AttackVectorResponse[]> {
    const year = toInt(query.discovered_year);
    if (Number.isNaN(year)) throw new BadRequestException();
    return this.service.findPublished(user?.id ?? null, year);
  }

  @Get('feed')
  @ApiOperation({ summary: '2. Лента (только опубликованные)', description: 'Доступно гостю. Из БД читается одна строка.' })
  @ApiOkResponse({ type: AttackVectorResponse })
  @ApiResponse({ status: 404, description: 'Услуга не найдена или удалена' })
  feed(@Query() query: FeedQuery, @CurrentUser() user: SessionUser | null): Promise<AttackVectorResponse> {
    const id = toInt(query.id);
    if (Number.isNaN(id)) throw new BadRequestException();
    return this.service.findFeed(user?.id ?? null, id, query.next === 'true');
  }

  @Get('draft')
  @AuthRequired()
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '3. Черновик текущего пользователя', description: 'Только для создателя.' })
  @ApiOkResponse({ type: AttackVectorResponse })
  @ApiResponse({ status: 401, description: 'Нет сессии' })
  @ApiResponse({ status: 404, description: 'Черновика нет' })
  draft(@CurrentUser() user: SessionUser): Promise<AttackVectorResponse> {
    return this.service.findDraft(user.id);
  }

  @Post()
  @AuthRequired()
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '4. Добавление услуги с изображением и видео', description: 'Только для создателя. Создатель проставляется из сессии.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRequest })
  @ApiCreatedResponse({ type: AttackVectorResponse })
  @ApiResponse({ status: 400, description: 'Нет названия или файлов' })
  @ApiResponse({ status: 401, description: 'Нет сессии' })
  @ApiResponse({ status: 409, description: 'Черновик уже есть' })
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }],
    { limits: { fileSize: 50 * 1024 * 1024 } }, // без dest файлы хранятся в памяти (buffer)
  ))
  create(
    @Body('title') title: string,
    @UploadedFiles() files: { image?: UploadedFile[]; video?: UploadedFile[] },
    @CurrentUser() user: SessionUser,
  ): Promise<AttackVectorResponse> {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!title?.trim() || !image?.mimetype.startsWith('image/') || !video?.mimetype.startsWith('video/')) {
      throw new BadRequestException();
    }
    return this.service.createDraft(user.id, { title: title.trim(), image, video });
  }

  @Put('draft/publish')
  @AuthRequired()
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '5. Публикация черновика', description: 'Только для создателя.' })
  @ApiOkResponse({ type: AttackVectorResponse })
  @ApiResponse({ status: 400, description: 'Неверные поля' })
  @ApiResponse({ status: 401, description: 'Нет сессии' })
  @ApiResponse({ status: 404, description: 'Черновика нет' })
  publish(@Body() body: PublishRequest, @CurrentUser() user: SessionUser): Promise<AttackVectorResponse> {
    const severity = toInt(body?.severity);
    const year = toInt(body?.discovered_year);
    const text = body?.short_description?.trim();
    if (!text || !severity || severity < 1 || severity > 10 || !year || year < 1900) {
      throw new BadRequestException();
    }
    return this.service.publishDraft(user.id, { short_description: text, severity, discovered_year: year });
  }

  @Delete(':id')
  @HttpCode(200)
  @AuthRequired()
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '6. Удаление услуги (soft delete)', description: 'Только своей услуги.' })
  @ApiOkResponse({ description: 'Удалено, тело пустое' })
  @ApiResponse({ status: 401, description: 'Нет сессии' })
  @ApiResponse({ status: 403, description: 'Чужая услуга' })
  @ApiResponse({ status: 404, description: 'Нет услуги' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser): Promise<void> {
    await this.service.softDelete(user.id, id);
  }

  @Post(':id/like')
  @HttpCode(200)
  @AuthRequired()
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: '7. Лайк: 1 ставит, 0 отменяет', description: 'Только для авторизованного пользователя.' })
  @ApiOkResponse({ type: AttackVectorResponse })
  @ApiResponse({ status: 400, description: 'like не 0 и не 1' })
  @ApiResponse({ status: 401, description: 'Нет сессии' })
  @ApiResponse({ status: 404, description: 'Нет услуги' })
  like(@Param('id', ParseIntPipe) id: number, @Body() body: LikeRequest, @CurrentUser() user: SessionUser): Promise<AttackVectorResponse> {
    const like = toInt(body?.like);
    if (like !== 0 && like !== 1) throw new BadRequestException();
    return this.service.setLike(user.id, id, like);
  }
}
