import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EmptyBodyExceptionFilter } from './common/empty-body-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new EmptyBodyExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Оценка уязвимости системы — API')
    .setDescription(
      'Веб-сервис векторов атак. Без авторизации доступны только методы чтения (список, лента). '
      + 'Методы создателя требуют сессию: выполните POST /api/users/login — браузер сохранит куку sessionId.',
    )
    .setVersion('4.0')
    .addCookieAuth('sessionId')
    .build();
  SwaggerModule.setup('swagger', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
