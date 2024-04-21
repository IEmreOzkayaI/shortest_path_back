import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from './common/config/init.config';
import ENV_VAR from './common/config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors();
  initConfig(app);
  const port = ENV_VAR.PORT || 3000;
  await app.listen(port);
  console.log(`Application listening on port ${port}`);
}
bootstrap();
