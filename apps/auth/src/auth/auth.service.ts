import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, LoginDto, Role, SignUpDto } from '@app/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/schema/user.schema';
import { createHash, randomUUID } from 'crypto';
import { RefreshSession } from '../refresh/schema/refresh-session.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ModifyRoleDto } from './dto/modify-role.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSession>,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = parseInt(
      configService.get<string>('BCRYPT_SALT_ROUNDS', '12'),
      10,
    );
  }
  private saltRounds = parseInt(
    this.configService.get<string>('BCRYPT_SALT_ROUNDS', '12'),
    10,
  );
  private signToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      ver: user.tokenVersion,
      createdAt: user.createdAt.toISOString(),
    };
    return this.jwtService.signAsync(payload);
  }
  async signUp(dto: SignUpDto) {
    if (await this.userModel.exists({ email: dto.email })) {
      throw new ConflictException('E-mail already registered');
    }
    const hash = await bcrypt.hash(dto.password, this.saltRounds);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash: hash,
      roles: [Role.USER],
      tokenVersion: 0,
    });
    return this.issueTokens(user);
  }
  async login({ email, password }: LoginDto) {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    const jtiHash = createHash('sha256').update(refreshToken).digest('hex');
    await this.sessionModel.deleteOne({ jtiHash });
  }

  async refresh(userId: string, refreshToken: string) {
    const jtiHash = createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.sessionModel.findOneAndDelete({ jtiHash }); // 재사용 방지
    if (!session) throw new UnauthorizedException('RT invalid');

    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const accessToken = await this.signToken(user);

    const jti = randomUUID();
    const jtiHash = createHash('sha256').update(jti).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7일

    await this.sessionModel.create({ userId: user.id, jtiHash, expiresAt });

    return {
      accessToken,
      refreshToken: jti,
    };
  }
  async addRole(dto: ModifyRoleDto): Promise<User> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('User not found');
    if (!user.roles.includes(dto.role)) {
      user.roles.push(dto.role);
      await user.save();
    }
    return user;
  }

  async removeRole(dto: ModifyRoleDto): Promise<User> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('User not found');
    user.roles = user.roles.filter((r) => r !== dto.role);
    await user.save();
    return user;
  }
}
