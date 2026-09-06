import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import { VectorsService } from './vectors.service';

@Controller('vectors')
export class VectorsController {
  constructor(private readonly vectorsService: VectorsService) {}

  @Get()
  @Render('vectors/list')
  getList() {
    const vectors = this.vectorsService.findAll();
    return {
      title: 'Векторы атак',
      data: { vectors, query: '' },
    };
  }

  @Post()
  @Render('vectors/list')
  search(@Body() body: { query?: string }) {
    const query = body?.query || '';
    const vectors = this.vectorsService.findAll(query);
    return {
      title: 'Векторы атак',
      data: { vectors, query },
    };
  }

  @Get(':id')
  @Render('vectors/detail')
  getOne(@Param('id') id: string) {
    const vector = this.vectorsService.findOne(Number(id));
    return {
      title: vector ? vector.title : 'Не найдено',
      data: { vector },
    };
  }
}
