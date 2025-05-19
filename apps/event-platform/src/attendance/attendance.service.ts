import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceLog } from './schema/attendance.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceLog.name)
    private readonly attendanceLogModel: Model<AttendanceLog>,
  ) {}

  async attend(userId: string, date: string) {
    const exists = await this.attendanceLogModel.exists({ userId, date });
    if (exists) return;
    await this.attendanceLogModel.create({ userId, date });
  }
}
