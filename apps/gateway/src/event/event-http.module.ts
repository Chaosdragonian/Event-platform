import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule as AxiosModule, HttpService } from '@nestjs/axios';
import { EVENT_HTTP_SERVICE } from '../common/tokens';
@Module({
  imports: [
    AxiosModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>(
          'EVENT_BASE_URL',
          'http://event:4002',
        ),
        withCredentials: true,
        timeout: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: EVENT_HTTP_SERVICE,
      useExisting: HttpService,
    },
  ],
  exports: [EVENT_HTTP_SERVICE],
})
export class EventHttpModule {}
