/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthFacade } from './auth.facade';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto, SignUpDto } from '@app/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authFacade: AuthFacade;

  const mockAuthFacade = {
    signUp: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockResponse = {
    json: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const createMockRequest = (refreshToken?: string) =>
    ({
      cookies: refreshToken ? { refresh_token: refreshToken } : {},
    }) as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthFacade,
          useValue: mockAuthFacade,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authFacade = module.get<AuthFacade>(AuthFacade);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authFacade.signUp', async () => {
      const dto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthFacade.signUp.mockResolvedValue(expectedResult);

      const result = await controller.signUp(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthFacade.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authFacade.login', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthFacade.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthFacade.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      const mockRequest = createMockRequest('valid-refresh-token');

      const expectedResult = {
        accessToken: 'new-access-token',
      };

      mockAuthFacade.refresh.mockResolvedValue(expectedResult);

      await controller.refresh(mockRequest, mockResponse);

      expect(mockAuthFacade.refresh).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw UnauthorizedException when refresh token is not provided', async () => {
      const mockRequest = createMockRequest();

      await expect(
        controller.refresh(mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should clear refresh token cookie and call authFacade.logout', async () => {
      const mockRequest = createMockRequest('valid-refresh-token');

      await controller.logout(mockRequest, mockResponse);

      expect(mockAuthFacade.logout).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.json).toHaveBeenCalledWith({ ok: true });
    });

    it('should not call authFacade.logout when refresh token is not provided', async () => {
      const mockRequest = createMockRequest();

      await controller.logout(mockRequest, mockResponse);

      expect(mockAuthFacade.logout).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.json).toHaveBeenCalledWith({ ok: true });
    });
  });
});
