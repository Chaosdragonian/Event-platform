import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class SetRefreshCookieInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const res = ctx.switchToHttp().getResponse();
    return next.handle().pipe(
      tap(({ setCookieHeaders }: { setCookieHeaders?: string[] }) => {
        if (setCookieHeaders) res.setHeader('set-cookie', setCookieHeaders);
      }),
    );
  }
}
