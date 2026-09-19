import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { VectorsService } from './attack_vectors.service';
@Controller()
export class VectorsController {
  constructor(private readonly VectorsService: VectorsService) {}

  @Get()
  @Render('tiles')
  getTiles(@Query('discoveredDate') discoveredDateRaw?: string) {
    const discoveredYear =
      discoveredDateRaw && discoveredDateRaw.length >= 4
        ? Number(discoveredDateRaw.slice(0, 4))
        : undefined;

    const vectors = this.VectorsService
      .findPublished(discoveredYear)
      .map((v) => ({
        ...v,
        likesCount: this.VectorsService.likesCount(v),
      }));

    return {
      title: 'Векторы атак',
      data: {
        vectors,
        discoveredDate: discoveredDateRaw ?? '',
        isTiles: true,
      },
    };
  }

  @Get('draft')
  @Render('draft')
  getDraft() {
    const vector = this.VectorsService.findDraft();
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
      vector = this.VectorsService.findPublished()[0];
    } else if (next === 'true') {
      vector = this.VectorsService.findNextPublished(id);
    } else {
      vector = this.VectorsService.findById(id);
    }

    const likesCount = vector
      ? this.VectorsService.likesCount(vector)
      : 0;

    return {
      title: vector ? vector.title : 'Не найдено',
      data: { vector, likesCount, isFeed: true },
    };
  }
}