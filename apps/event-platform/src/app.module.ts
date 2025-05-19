import { AccountAgeCondition } from './common/condition/strategies/account-age.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event/schema/event.schema';
import { Reward, RewardSchema } from './reward/schema/reward.schema';
import { Claim, ClaimSchema } from './reward/schema/claim.schema';
import { ConditionFactory } from './common/condition/condition.factory';
import { EventService } from './event/event.service';
import { RewardController } from './reward/reward.controller';
import { EventController } from './event/event.controller';
import { JwtAuthGuard, JwtStrategy, RolesGuard } from '@app/common';
import {
  AttendanceLog,
  AttendanceLogSchema,
} from './attendance/schema/attendance.schema';
import { AttendanceStreakCondition } from './common/condition/strategies/attendance-streak.strategy';
import { PassportModule } from '@nestjs/passport';
import { RewardService } from './reward/reward.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: AttendanceLog.name, schema: AttendanceLogSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EventController, RewardController, AttendanceController],
  providers: [
    EventService,
    RewardService,
    ConditionFactory,
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    AttendanceStreakCondition,
    AccountAgeCondition,
    AttendanceService,
  ],
})
export class AppModule {}
