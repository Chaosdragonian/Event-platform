import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IConditionChecker } from '../condition.interface';
import { JwtPayload } from '@event-platform/common';

@Injectable()
export class AccountAgeCondition implements IConditionChecker {
  constructor() {}

  async check(userId: JwtPayload, meta: { days: number }): Promise<void> {
    const createdAt = new Date(userId.createdAt);
    const ageDays = (Date.now() - createdAt.getTime()) / 86400000;
    if (ageDays < meta.days) {
      throw new UnauthorizedException(
        `Account must be at least ${meta.days} days old`,
      );
    }
  }
}
