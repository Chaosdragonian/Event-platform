import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConditionChecker } from '../condition.interface';
import { AttendanceLog } from 'apps/event-platform/src/attendance/schema/attendance.schema';

@Injectable()
export class AttendanceStreakCondition implements IConditionChecker {
  constructor(
    @InjectModel(AttendanceLog.name)
    private readonly logs: Model<AttendanceLog>,
  ) {}

  async check(user: any, meta: { days: number }) {
    const today = new Date();
    // 지난 N일(0:오늘, N-1:과거 N-1일) 모두 출석이 있어야 통과
    for (let i = 0; i < meta.days; i++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const dateStr = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const found = await this.logs.exists({ userId: user.sub, date: dateStr });
      if (!found) {
        throw new UnauthorizedException(
          `출석 ${i + 1}일차 미달 (필요: ${meta.days}일)`,
        );
      }
    }
  }
}
