import {
  Body,
  Controller,
  HttpException,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, throwError } from 'rxjs';
import {
  JwtAuthGuard,
  LoginDto,
  Public,
  Role,
  Roles,
  RolesGuard,
  SignUpDto,
} from '@event-platform/common';
import { Request, Response } from 'express';
import { SetRefreshCookieInterceptor } from './set-refresh-cookie.interceptor';
import { ModifyRoleDto } from 'apps/auth/src/auth/dto/modify-role.dto';
import { AxiosError } from 'axios';
import { AUTH_HTTP_SERVICE } from '../common/tokens';

@Controller('auth')
@UseInterceptors(SetRefreshCookieInterceptor)
export class AuthProxyController {
  constructor(
    @Inject(AUTH_HTTP_SERVICE) private readonly httpService: HttpService,
  ) {}

  private forward(path: string, data: any, res: Response, req?: Request) {
    const forwardHeaders: Record<string, string> = {};
    if (req.headers.cookie) forwardHeaders.cookie = req.headers.cookie;
    if (req.headers.authorization)
      forwardHeaders.authorization = req.headers.authorization;

    return this.httpService.post(path, data, { headers: forwardHeaders }).pipe(
      map(({ data, headers, status }) => {
        if (headers['set-cookie'])
          (res as any).setCookieHeaders = headers['set-cookie']; // 인터셉터에 전달
        res.status(status);
        return data;
      }),
      catchError((err: AxiosError) => {
        const status = err.response?.status ?? 500;
        const body = err.response?.data ?? { message: err.message };
        return throwError(() => new HttpException(body, status));
      }),
    );
  }
  private readonly logger = new Logger(AuthProxyController.name);
  @Public()
  @Post('signup')
  signUp(
    @Body() dto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.forward('/auth/signup', dto, res, req);
  }

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.forward('/auth/login', dto, res, req);
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    console.log('refreshToken :', refreshToken);
    return this.forward('/auth/refresh', {}, res, req);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.forward('/auth/logout', {}, res, req);
  }
  @Post('role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addRole(
    @Body() dto: ModifyRoleDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('addRole :', dto);

    return this.forward('/auth/role', dto, res, req);
  }

  @Post('remove-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeRole(
    @Body() dto: ModifyRoleDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('removeRole :', req.headers);
    return this.forward('/auth/remove-role', dto, res, req);
  }
}
