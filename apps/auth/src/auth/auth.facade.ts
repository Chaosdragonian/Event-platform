import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto, LoginDto } from '@event-platform/common';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { ModifyRoleDto } from './dto/modify-role.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class AuthFacade {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) {}
  private readonly logger = new Logger(AuthFacade.name);
  async signUp(dto: SignUpDto): Promise<AuthTokens> {
    this.logger.log(`signUp : ${dto.email}`);

    try {
      const user = await this.userService.create(dto);
      return this.issue(user.id);
    } catch (error) {
      throw new ConflictException('User already exists', error);
    }
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userService.validatePassword(dto);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.issue(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { userId } = await this.sessionService.consume(refreshToken);
    return this.issue(userId);
  }

  async logout(refreshToken: string) {
    await this.sessionService.invalidate(refreshToken);
  }

  private async issue(userId: Types.ObjectId): Promise<AuthTokens> {
    const user = await this.userService.findById(userId);
    const accessToken = await this.tokenService.signAccess(user);
    const { token: refreshToken, expiresAt } =
      await this.sessionService.create(userId);
    return { accessToken, refreshToken, expiresAt };
  }

  async addRole(dto: ModifyRoleDto) {
    this.logger.log(`addRole : ${dto.email}`);
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');
    if (!user.roles.includes(dto.role)) {
      user.roles.push(dto.role);
      await user.save();
    }
    const Result = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
    return Result;
  }

  async removeRole(dto: ModifyRoleDto) {
    this.logger.log(`removeRole : ${dto.email}`);
    const user = await this.userService.findByEmail(dto.email);
    this.logger.log(user.roles); // ['admin', 'user']
    this.logger.log(dto.role); // 'user'
    if (!user) throw new NotFoundException('User not found');
    user.roles = user.roles.filter((r) => r !== dto.role);
    await user.save();
    const Result = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
    return Result;
  }
}
