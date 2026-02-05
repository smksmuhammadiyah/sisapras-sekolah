import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Global cache for Vercel
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({
      origin: '*', // Allow all
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    await app.init();
  }
  // Return the native Express instance
  return app.getHttpAdapter().getInstance();
}

// Local Development
if (!process.env.VERCEL) {
  (async () => {
    const localApp = await NestFactory.create(AppModule);
    localApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    localApp.enableCors({ origin: '*' });
    await localApp.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: ${await localApp.getUrl()}`);
  })();
}

// Vercel Entry Point
export default async function handler(req: any, res: any) {
  const instance = await bootstrap();
  return instance(req, res);
}
