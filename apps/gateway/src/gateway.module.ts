import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthProxyController } from './auth/auth-proxy.controller';
import { EventProxyController } from './event/event-proxy.controller';
import { JwtAuthGuard, JwtStrategy, RolesGuard } from '@app/common';
import { RewardProxyController } from './event/reward-proxy.controller';
import { EventProxyModule } from './event/event-proxy.module';
import { AuthProxyModule } from './auth/auth-proxy.module';
import { EventHttpModule } from './event/event-http.module';
import { AuthHttpModule } from './auth/auth-http.module';
import { AttendanceProxyController } from './event/attendance-proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    AuthProxyModule,
    EventProxyModule,
    AuthHttpModule,
    EventHttpModule,
  ],
  controllers: [
    GatewayController,
    AuthProxyController,
    EventProxyController,
    RewardProxyController,
    AttendanceProxyController,
  ],
  providers: [GatewayService, JwtStrategy, JwtAuthGuard, RolesGuard],
})
export class GatewayModule {}
