import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SignUpDto } from '@app/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly saltRound: number;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    this.saltRound = configService.get<number>('BCRYPT_SALT', 12);
  }

  async exists(email: string) {
    return this.userModel.exists({ email });
  }

  async create(dto: SignUpDto) {
    if (await this.userModel.exists({ email: dto.email })) {
      throw new ConflictException('E-mail already registered');
    }
    const hash = await bcrypt.hash(dto.password, this.saltRound);
    return this.userModel.create({ email: dto.email, passwordHash: hash });
  }

  async validatePassword({ email, password }: LoginDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
  async findById(id: Types.ObjectId) {
    return this.userModel.findById(id);
  }

  incTokenVersion(id: string) {
    return this.userModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
  }
}
