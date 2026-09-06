import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { VectorsService } from '../vectors/vectors.service';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly vectorsService: VectorsService,
  ) {}

  @Get()
  @Render('requests/list')
  getList() {
    const requests = this.requestsService.findAll();
    return {
      title: 'Заявки на оценку риска',
      data: { requests, query: '' },
    };
  }

  @Post()
  @Render('requests/list')
  search(@Body() body: { query?: string }) {
    const query = body?.query || '';
    const requests = this.requestsService.findAll(query);
    return {
      title: 'Заявки на оценку риска',
      data: { requests, query },
    };
  }

  @Get(':id')
  @Render('requests/detail')
  getOne(@Param('id') id: string) {
    const request = this.requestsService.findOne(Number(id));
    const vectors = request
      ? request.vectorIds
          .map((vid) => this.vectorsService.findOne(vid))
          .filter((v) => v !== undefined)
      : [];
    return {
      title: request ? request.systemName : 'Не найдено',
      data: { request, vectors },
    };
  }
}
