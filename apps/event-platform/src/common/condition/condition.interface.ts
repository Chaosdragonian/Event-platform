import { JwtPayload } from '@app/common';

export interface IConditionChecker {
  check(userId: JwtPayload, meta?: Record<string, any>): Promise<void>;
}
