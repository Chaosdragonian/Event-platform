import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(app.get(JwtAuthGuard));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
