import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { SignUpDto } from '@event-platform/common';

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<User>;

  const mockUser = {
    _id: '6826c31da2d8324b209f56bf',
    email: 'test@test.com',
    passwordHash:
      '$2b$12$DMFXy2ZlAGB9jFHSKXU6ZuBvcqwNawGMrVlQouI6e0a9SkXErSQdu',
    tokenVersion: 0,
    createdAt: new Date(),
  };

  const mockModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(12),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      mockModel.exists.mockResolvedValue(false);
      mockModel.create.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockModel.exists).toHaveBeenCalledWith({ email: dto.email });
      expect(mockModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      mockModel.exists.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validatePassword', () => {
    it('should return user if password is valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test12345!',
      };

      mockModel.findOne.mockResolvedValue(mockUser);

      const result = await service.validatePassword(loginDto);

      expect(result).toEqual(mockUser);
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
    });

    it('should return null if user not found', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      mockModel.findOne.mockResolvedValue(null);

      const result = await service.validatePassword(loginDto);

      expect(result).toBeNull();
    });
  });
});
