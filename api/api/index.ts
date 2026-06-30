import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  app.getHttpAdapter().getInstance()(req, res);
}
