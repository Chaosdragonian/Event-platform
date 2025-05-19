import { IsDateString } from 'class-validator';

export class AttendDto {
  @IsDateString() date: string;
}
