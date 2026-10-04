import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmptyBodyExceptionFilter } from './common/empty-body-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new EmptyBodyExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
