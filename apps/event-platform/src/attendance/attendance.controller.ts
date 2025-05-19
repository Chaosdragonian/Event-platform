import { Controller, Post, Req, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendDto } from '@app/common/dto/attend.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  attend(@Req() req, @Body() dto: AttendDto) {
    const date = dto.date ?? new Date().toISOString().slice(0, 10);
    return this.attendanceService.attend(req.user.sub, date);
  }
}
