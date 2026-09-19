import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'public'));

  hbs.registerPartials(join(__dirname, '..', 'views/partials'));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Приложение запущено: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
