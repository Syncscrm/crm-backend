import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors()); // Adicione esta linha para habilitar o CORS
  await app.listen(3002);
}
bootstrap();
