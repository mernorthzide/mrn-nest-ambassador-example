import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation
  app.useGlobalPipes(new ValidationPipe());

  // Cookie parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Ambassador API')
    .setDescription('The ambassador API description')
    .setVersion('1.0')
    .addTag('ambassador')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
