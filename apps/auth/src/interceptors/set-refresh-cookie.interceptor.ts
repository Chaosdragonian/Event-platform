import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class SetRefreshCookieInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const res = ctx.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap((tokens) => {
        if (!tokens?.refreshToken) return;
        res.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 3600 * 1000,
        });
      }),
    );
  }
}
