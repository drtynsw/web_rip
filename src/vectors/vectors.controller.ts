import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { VectorsService } from './vectors.service';

@Controller()
export class VectorsController {
  constructor(private readonly vectorsService: VectorsService) {}

  @Get()
  @Render('tiles')
  getTiles(@Query('minSeverity') minSeverityRaw?: string) {
    const minSeverity =
      minSeverityRaw !== undefined && minSeverityRaw !== ''
        ? Number(minSeverityRaw)
        : undefined;

    const vectors = this.vectorsService
      .findPublished(minSeverity)
      .map((v) => ({
        ...v,
        likesCount: this.vectorsService.likesCount(v),
      }));

    return {
      title: 'Векторы атак',
      data: {
        vectors,
        minSeverity: minSeverityRaw ?? '',
        isTiles: true,
      },
    };
  }

  @Get('draft')
  @Render('draft')
  getDraft() {
    const vector = this.vectorsService.findDraft();
    return {
      title: 'Добавление',
      data: { vector, isDraft: true },
    };
  }

  @Get(['feed', 'feed/:id'])
  @Render('feed')
  getFeed(@Param('id') idParam?: string, @Query('next') next?: string) {
    const id = idParam !== undefined ? Number(idParam) : undefined;

    let vector;
    if (id === undefined) {
      vector = this.vectorsService.findPublished()[0];
    } else if (next === 'true') {
      vector = this.vectorsService.findNextPublished(id);
    } else {
      vector = this.vectorsService.findById(id);
    }

    const likesCount = vector ? this.vectorsService.likesCount(vector) : 0;

    return {
      title: vector ? vector.title : 'Не найдено',
      data: { vector, likesCount, isFeed: true },
    };
  }
}
