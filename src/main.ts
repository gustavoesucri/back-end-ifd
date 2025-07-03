import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não esperadas
      forbidNonWhitelisted: true, // lança erro se houver propriedades extras
      transform: true, // ativa a transformação para usar @Transform()
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000'], // domínios permitidos
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // se for enviar cookies ou headers com token
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch(console.error);
