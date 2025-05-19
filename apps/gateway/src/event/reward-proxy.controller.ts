import { Role, Roles } from '@app/common';
import { ClaimRewardDto } from '@app/common/dto/claim-reward.dto';
import { CreateRewardDto } from '@app/common/dto/create-reward.dto';
import { ListClaimsDto } from '@app/common/dto/list-claim.dto';
import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { catchError, map, throwError } from 'rxjs';
import { EVENT_HTTP_SERVICE } from '../common/tokens';

@Controller('reward')
export class RewardProxyController {
  constructor(
    @Inject(EVENT_HTTP_SERVICE) private readonly httpService: HttpService,
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
  private getForward(path: string, data: any, res: Response, req?: Request) {
    const forwardHeaders: Record<string, string> = {};
    if (req.headers.cookie) forwardHeaders.cookie = req.headers.cookie;
    if (req.headers.authorization)
      forwardHeaders.authorization = req.headers.authorization;

    return this.httpService.get(path, { headers: forwardHeaders }).pipe(
      map(({ data, headers, status }) => {
        if (headers['set-cookie'])
          (res as any).setCookieHeaders = headers['set-cookie'];
        res.status(status);
        return data;
      }),
      catchError((err: AxiosError) => {
        const status = err.response?.status ?? 500;
        const body = err.response?.data ?? { message: err.message };
        // Nest에게 HttpException 으로 던지면 그대로 status·body 로 응답
        return throwError(() => new HttpException(body, status));
      }),
    );
  }

  @Roles(Role.OPERATOR, Role.ADMIN)
  @Post()
  createReward(
    @Body() dto: CreateRewardDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    return this.forward('/reward', dto, res, req);
  }
  @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
  @Get()
  listRewards(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Query('eventId') eventId?: string,
  ) {
    return this.getForward('/reward', { eventId }, res, req);
  }
  @Roles(Role.USER, Role.OPERATOR, Role.ADMIN)
  @Post('claim')
  claim(
    @Body() dto: ClaimRewardDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    return this.forward('/reward/claim', dto, res, req);
  }
  @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
  @Get('claim')
  listClaims(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ListClaimsDto,
  ) {
    return this.getForward('/reward/claim', dto, res, req);
  }
}
