import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import * as cookieParser from 'cookie-parser';
import { JwtAuthGuard, RolesGuard } from '@app/common';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
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
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
  app.enableCors();
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
  console.log('[Gateway] HTTP listening 3000');
}
bootstrap();
