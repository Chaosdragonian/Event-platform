import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  ver: number;
  iat?: number;
  exp?: number;
  createdAt: string;
}
