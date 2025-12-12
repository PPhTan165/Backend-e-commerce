import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.DB_PORT ?? 3306);
  console.log("Server chạy với port: ", process.env.DB_PORT)
}
bootstrap();
