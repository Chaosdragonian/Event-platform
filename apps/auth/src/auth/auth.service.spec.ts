/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import {
  RefreshSession,
  RefreshSessionSchema,
} from '../refresh/schema/refresh-session.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, LoginDto, Role, SignUpDto } from '@app/common';
import { Types } from 'mongoose';
import { UserModule } from '../user/user.module';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let sessionModel: Model<RefreshSession>;
  let jwtService: JwtService;
  let configService: ConfigService;
  const mockUser = {
    _id: new Types.ObjectId(),
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    roles: [Role.USER],
    tokenVersion: 0,
    createdAt: new Date(),
  };

  const mockUserModel = {
    exists: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockSessionModel = {
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('12'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(RefreshSession.name),
          useValue: mockSessionModel,
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
      imports: [UserModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    sessionModel = module.get<Model<RefreshSession>>(
      getModelToken(RefreshSession.name),
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return tokens', async () => {
      const dto: SignUpDto = {
        email: 'test1@gmail.com',
        password: 'Password12345!',
      };

      mockUserModel.exists.mockResolvedValue(false);
      mockUserModel.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      mockSessionModel.create.mockResolvedValue({});

      const result = await service.signUp(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserModel.exists).toHaveBeenCalledWith({ email: dto.email });
      expect(mockUserModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: SignUpDto = {
        email: 'test@test.com',
        password: 'Test12345!',
      };

      mockUserModel.exists.mockResolvedValue(true);

      await expect(service.signUp(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@test.com',
        password: 'Test12345!',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      mockSessionModel.create.mockResolvedValue({});

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: dto.email });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userId = mockUser.id;

      mockSessionModel.findOneAndDelete.mockResolvedValue({});
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');
      mockSessionModel.create.mockResolvedValue({});

      const result = await service.refresh(userId, refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockSessionModel.findOneAndDelete).toHaveBeenCalled();
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      const userId = mockUser.id;

      mockSessionModel.findOneAndDelete.mockResolvedValue(null);

      await expect(service.refresh(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
