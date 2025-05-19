import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule as AxiosModule, HttpService } from '@nestjs/axios';
import { AUTH_HTTP_SERVICE } from '../common/tokens';
@Module({
  imports: [
    AxiosModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('AUTH_BASE_URL', 'http://auth:4001'),
        withCredentials: true,
        timeout: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: AUTH_HTTP_SERVICE,
      useExisting: HttpService,
    },
  ],
  exports: [AUTH_HTTP_SERVICE],
})
export class AuthHttpModule {}
