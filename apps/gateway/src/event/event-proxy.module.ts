import { Module } from '@nestjs/common';
import { EventHttpModule } from './event-http.module';
import { EventProxyController } from './event-proxy.controller';
import { RewardProxyController } from './reward-proxy.controller';

@Module({
  imports: [EventHttpModule],
  controllers: [EventProxyController, RewardProxyController],
})
export class EventProxyModule {}
