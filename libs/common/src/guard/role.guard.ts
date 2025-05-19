import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!user?.roles) throw new ForbiddenException('권한 정보가 없습니다');

    const hasRole = required.some((r) => user.roles.includes(r));
    if (!hasRole) throw new ForbiddenException('권한이 없습니다');
    return true;
  }
}
