import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common';

async function bootstrap() {
  console.log('------------------- [settings] -------------------');
  console.log(
    Object.entries(process.env)
      .filter(([k]) => !k.startsWith('_') && !/[a-z]/.test(k))
      .reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {}),
  );
  console.log('--------------------------------------------------');
  const app = await NestFactory.create(AuthModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.use(cookieParser());
  app.useGlobalGuards(app.get(JwtAuthGuard));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
