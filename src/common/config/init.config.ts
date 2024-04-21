import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from '../exception/global-exception.filter';
import { GlobalResponseInterceptor } from '../global-response.interceptor';

export function initConfig(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(Logger)));
}
