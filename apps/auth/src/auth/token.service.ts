import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@event-platform/common';
import { User } from '../user/schema/user.schema';

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  signAccess(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      ver: user.tokenVersion,
      createdAt: user.createdAt.toISOString(),
    };
    return this.jwt.signAsync(payload);
  }
}
