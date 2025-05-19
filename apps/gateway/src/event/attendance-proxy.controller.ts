import { JwtAuthGuard } from '@app/common';
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
} from '@nestjs/common';
import { EVENT_HTTP_SERVICE } from '../common/tokens';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { catchError, map, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AttendDto } from '@app/common/dto/attend.dto';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceProxyController {
  constructor(
    @Inject(EVENT_HTTP_SERVICE) private readonly httpService: HttpService,
  ) {}
  private readonly logger = new Logger(AttendanceProxyController.name);
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
        return throwError(() => new HttpException(body, status));
      }),
    );
  }
  @Post()
  attend(
    @Req() req,
    @Body() dto: AttendDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('attendance :', dto.date);
    return this.forward('/attendance', dto, res, req);
  }
}
