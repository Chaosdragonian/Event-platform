import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from '../../../../libs/common/src/guard/jwt-auth.guard';
import { catchError, map, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { Role, Roles } from '@app/common';
import { AxiosError } from 'axios';
import { CreateEventDto } from 'apps/event-platform/src/event/dto/create-event.dto';
import { EVENT_HTTP_SERVICE } from '../common/tokens';

@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventProxyController {
  constructor(
    @Inject(EVENT_HTTP_SERVICE) private readonly httpService: HttpService,
  ) {}
  private readonly logger = new Logger(EventProxyController.name);
  private forward(path: string, data: any, res: Response, req?: Request) {
    const forwardHeaders: Record<string, string> = {};
    if (req.headers.cookie) forwardHeaders.cookie = req.headers.cookie;
    if (req.headers.authorization)
      forwardHeaders.authorization = req.headers.authorization;

    return this.httpService.post(path, data, { headers: forwardHeaders }).pipe(
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
  @Post('create')
  @Roles(Role.OPERATOR, Role.ADMIN)
  create(
    @Body() dto: CreateEventDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('create :', dto);
    return this.forward('/event/create', dto, res, req);
  }

  @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
  @Get()
  list(@Req() req, @Query('active') active?: string) {
    return this.getForward('/event', { active }, req.res, req);
  }
  @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
  @Get(':id')
  get(@Param('id') id: string, @Req() req) {
    return this.getForward(`/event/${id}`, {}, req.res, req);
  }
}
