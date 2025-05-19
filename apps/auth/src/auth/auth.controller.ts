import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthFacade } from './auth.facade';
import { SetRefreshCookieInterceptor } from '../interceptors/set-refresh-cookie.interceptor';
import { JwtAuthGuard, LoginDto, Public, SignUpDto } from '@app/common';
import { ModifyRoleDto } from './dto/modify-role.dto';

@Controller('auth')
@UseInterceptors(SetRefreshCookieInterceptor) // 모든 응답에 쿠키 세팅
export class AuthController {
  constructor(private authFacade: AuthFacade) {}
  private readonly logger = new Logger(AuthController.name);
  @Public()
  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return this.authFacade.signUp(dto);
  }
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.logger.log('login :', dto.email);
    return this.authFacade.login(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    this.logger.log('refreshToken :', refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    const { accessToken } = await this.authFacade.refresh(refreshToken);
    return res.json({ accessToken });
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) await this.authFacade.logout(refreshToken);
    res.clearCookie('refresh_token');
    return res.json({ ok: true });
  }
  @Post('role')
  addRole(@Body() dto: ModifyRoleDto) {
    return this.authFacade.addRole(dto);
  }

  @Post('remove-role')
  removeRole(@Body() dto: ModifyRoleDto) {
    return this.authFacade.removeRole(dto);
  }
}
