import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Render,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  AttackVectorsService,
  DEFAULT_IMAGE_KEY,
  DEFAULT_VIDEO_KEY,
} from './attack_vectors.service';
import { getCurrentUserId } from './current-user';

@Controller()
export class AttackVectorsController {
  constructor(private readonly attackVectorsService: AttackVectorsService) {}

  @Get()
  @Render('tiles')
  async getTiles(@Query('discoveredDate') discoveredDateRaw?: string) {
    const discoveredYear =
      discoveredDateRaw && discoveredDateRaw.length >= 4
        ? Number(discoveredDateRaw.slice(0, 4))
        : undefined;

    const published = await this.attackVectorsService.findPublished(discoveredYear);
    const vectors = await Promise.all(
      published.map(async (v) => ({
        ...v,
        likesCount: await this.attackVectorsService.likesCount(v.id),
      })),
    );

    return {
      title: 'Векторы атак',
      data: {
        vectors,
        discoveredDate: discoveredDateRaw ?? '',
        isTiles: true,
      },
    };
  }

  @Get(['feed', 'feed/:id'])
  async getFeed(
    @Res() res: Response,
    @Param('id') idParam?: string,
    @Query('next') next?: string,
  ) {
    const id = idParam !== undefined ? Number(idParam) : undefined;

    let vector;
    if (id === undefined) {
      vector = await this.attackVectorsService.findFirstPublished();
    } else if (next === 'true') {
      vector = await this.attackVectorsService.findNextPublished(id);
    } else {
      vector = await this.attackVectorsService.findOnePublished(id);
    }

    if (!vector) {
      return res.redirect('/');
    }

    const likesCount = await this.attackVectorsService.likesCount(vector.id);

    return res.render('feed', {
      title: vector.title,
      data: { vector, likesCount, isFeed: true },
    });
  }

  @Get('draft')
  @Render('draft')
  async getDraft() {
    const userId = getCurrentUserId();
    const vector = await this.attackVectorsService.findDraftByUser(userId);

    return {
      title: 'Добавление',
      data: {
        vector,
        hasDraft: !!vector,
        defaultImage: DEFAULT_IMAGE_KEY,
        defaultVideo: DEFAULT_VIDEO_KEY,
        isDraft: true,
      },
    };
  }

  @Post('draft')
  @Redirect('/draft')
  async createDraft(@Body('title') title: string) {
    const userId = getCurrentUserId();
    await this.attackVectorsService.createDraft(userId, title || 'Без названия');
  }

  @Post('draft/publish')
  @Redirect('/')
  async publishDraft(
    @Body('id') idRaw: string,
    @Body('shortDescription') shortDescription: string,
    @Body('severity') severityRaw: string,
    @Body('discoveredYear') discoveredYearRaw: string,
  ) {
    const id = Number(idRaw);
    const severity = Number(severityRaw);
    const discoveredYear = Number(discoveredYearRaw);
    if (!Number.isNaN(id)) {
      await this.attackVectorsService.publishDraft(
        id,
        shortDescription,
        severity,
        discoveredYear,
      );
    }
  }

  @Post('delete')
  @Redirect('/')
  async deleteVector(@Body('id') idRaw: string) {
    const id = Number(idRaw);
    if (!Number.isNaN(id)) {
      await this.attackVectorsService.softDeleteBySql(id);
    }
  }
}
