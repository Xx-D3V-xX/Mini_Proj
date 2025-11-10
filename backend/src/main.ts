import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const normalizeOrigin = (value: string) => value.replace(/\/+$/, '');
  const originEnv = configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173';
  const allowedOrigins = originEnv
    .split(/[,\s]+/)
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);
  const allowAllOrigins = allowedOrigins.includes('*');

  app.use(cookieParser());
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const normalizedRequestOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : undefined;

      if (!requestOrigin && allowedOrigins.length === 1 && !allowAllOrigins) {
        return callback(null, allowedOrigins[0]);
      }

      if (
        allowAllOrigins ||
        !normalizedRequestOrigin ||
        allowedOrigins.some((origin) => origin === normalizedRequestOrigin)
      ) {
        const responseOrigin = requestOrigin ?? allowedOrigins[0];
        return callback(null, responseOrigin);
      }

      return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    optionsSuccessStatus: 204,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MumbAI Trails API')
    .setDescription('NestJS backend powering MumbAI Trails')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port);
}

bootstrap();
