import {
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { EventConditionType } from '@event-platform/common';

export class CreateEventDto {
  @IsString() title: string;

  @IsEnum(EventConditionType)
  conditionType: EventConditionType;

  @IsOptional()
  conditionMeta?: Record<string, any>;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsBoolean()
  active: boolean;
}
