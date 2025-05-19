import { EventConditionType } from '@app/common/enums/event-condition-type.enum';
import { SampleCondition } from './strategies/sample-condition.strategy';
import { AccountAgeCondition } from './strategies/account-age.strategy';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IConditionChecker } from './condition.interface';
import { AttendanceStreakCondition } from './strategies/attendance-streak.strategy';

const strategyMap = {
  [EventConditionType.SAMPLE]: SampleCondition,
  [EventConditionType.ACCOUNT_AGE]: AccountAgeCondition,
  [EventConditionType.ATTENDANCE_STREAK]: AttendanceStreakCondition,
};

@Injectable()
export class ConditionFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  get(type: EventConditionType): IConditionChecker {
    const Cls = strategyMap[type];
    if (!Cls) {
      throw new NotFoundException(`No condition strategy for type "${type}"`);
    }
    // Nest DI 컨테이너에서 프로바이더로 등록된 인스턴스 꺼내기
    return this.moduleRef.get<IConditionChecker>(Cls, { strict: false });
  }
}
