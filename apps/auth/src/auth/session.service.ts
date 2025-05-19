import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID, createHash } from 'crypto';
import { RefreshSession } from '../refresh/schema/refresh-session.schema';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(RefreshSession.name)
    private sessionModel: Model<RefreshSession>,
  ) {}

  private hash(jti: string) {
    return createHash('sha256').update(jti).digest('hex');
  }

  async create(userId: Types.ObjectId) {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + 604800000); // 7일
    await this.sessionModel.create({
      userId,
      jtiHash: this.hash(jti),
      expiresAt,
    });
    return { token: jti, expiresAt };
  }

  /** consume & return session (재사용 방지) */
  async consume(refreshToken: string) {
    const session = await this.sessionModel.findOneAndDelete({
      jtiHash: this.hash(refreshToken),
    });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    return session;
  }

  async invalidate(rt: string) {
    await this.sessionModel.deleteOne({ jtiHash: this.hash(rt) });
  }
}
