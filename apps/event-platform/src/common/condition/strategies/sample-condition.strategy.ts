/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from '@app/common';
import { IConditionChecker } from '../condition.interface';

export class SampleCondition implements IConditionChecker {
  check(userId: JwtPayload, meta?: Record<string, any>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
