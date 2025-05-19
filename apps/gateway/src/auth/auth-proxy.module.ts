import { Module } from '@nestjs/common';
import { AuthHttpModule } from './auth-http.module';
import { AuthProxyController } from './auth-proxy.controller';

@Module({
  imports: [AuthHttpModule],
  controllers: [AuthProxyController],
})
export class AuthProxyModule {}
