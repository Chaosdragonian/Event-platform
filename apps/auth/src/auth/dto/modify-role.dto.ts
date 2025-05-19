import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@event-platform/common';

export class ModifyRoleDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;
}
