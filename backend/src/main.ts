import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // app.enableCors(); // CORS is handled in dynamic configuration or standard pattern
  app.enableCors({
    origin: '*', // Allow all for Vercel/Production simplicity initially, or configure strict
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Only listen if not running in Vercel (Vercel handles the server lifecycle)
  if (!process.env.VERCEL) {
    await app.listen(process.env.PORT ?? 3000);
  }

  return app; // Export app for Vercel
}
if (!process.env.VERCEL) {
  bootstrap();
}
export default bootstrap;
