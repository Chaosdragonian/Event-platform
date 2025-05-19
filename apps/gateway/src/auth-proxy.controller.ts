import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';
import { Response, Request } from 'express';
import { LoginDto, SignUpDto } from '@event-platform/common';
import { JwtAuthGuard } from '../../../libs/common/src/guard/jwt-auth.guard';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly http: HttpService) {}

  /* 공통: Set-Cookie 헤더를 그대로 전달해야 RT 쿠키가 붙음 */
  private forward<T>(obs: Observable<AxiosResponse<T>>, res: Response) {
    return obs.pipe(
      map(({ data, headers, status }) => {
        // RT 쿠키 헤더 복사
        if (headers['set-cookie'])
          res.setHeader('set-cookie', headers['set-cookie']);
        res.status(status);
        return data;
      }),
    );
  }

  @Post('signup')
  signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    return this.forward(this.http.post('/auth/signup', dto), res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.forward(this.http.post('/auth/login', dto), res);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // refresh 쿠키 자동 포함: axios withCredentials 설정
    return this.forward(
      this.http.post(
        '/auth/refresh',
        {},
        { headers: { cookie: req.headers.cookie } },
      ),
      res,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.forward(
      this.http.post(
        '/auth/logout',
        {},
        { headers: { cookie: req.headers.cookie } },
      ),
      res,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) {
    return req.user;
  }
}
