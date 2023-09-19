import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { generateHashPassword, generateSalt } from '../utils/password';
import { Sessions } from '../entities/Sessions';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const mockUsersRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockSessionsRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const token = 'token';
const userAgent = 'user-agent';
const clientIp = ':::1';

describe('AuthService', () => {
  let service: AuthService;
  let user;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Users), useValue: mockUsersRepository },
        {
          provide: getRepositoryToken(Sessions),
          useValue: mockSessionsRepository,
        },
        { provide: JwtService, useValue: mockJwtService },
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    user = {
      email: 'test@email.com',
      nickname: 'test',
      password: 'password',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const salt = await generateSalt();
    const hashedPassword = await generateHashPassword(user.password, salt);

    user.salt = salt;
    user.hashedPassword = hashedPassword;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('success', async () => {
      const req = {
        email: user.email,
        password: user.password,
        nickname: user.nickname,
      };

      const expectedUser = user;

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockResolvedValue(expectedUser);

      const result = await service.register(
        req.email,
        req.password,
        req.nickname,
      );

      expect(result.email).toEqual(expectedUser.email);
      expect(result.nickname).toEqual(expectedUser.nickname);
      expect(result.userId).toEqual(expectedUser.userId);
      expect(result.createdAt).toEqual(expectedUser.createdAt);
      expect(result.updatedAt).toEqual(expectedUser.updatedAt);

      saveUsersSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        email: user.email,
        password: user.password,
        nickname: user.nickname,
      };

      const expectedError = new Error();

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(new InternalServerErrorException());

      saveUsersSpy.mockRestore();
    });

    it('duplicate email', async () => {
      const req = {
        email: user.email,
        password: user.password,
        nickname: user.nickname,
      };

      const expectedError = {
        code: 'ER_DUP_ENTRY',
        sqlMessage: "Duplicate entry 'test@email.com' for key 'email'",
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(
        new BadRequestException(expectedError.sqlMessage),
      );

      saveUsersSpy.mockRestore();
    });

    it('duplicate nickname', async () => {
      const req = {
        email: user.email,
        password: user.password,
        nickname: user.nickname,
      };

      const expectedError = {
        code: 'ER_DUP_ENTRY',
        sqlMessage: "Duplicate entry 'test' for key 'nickname'",
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(
        new BadRequestException(expectedError.sqlMessage),
      );

      saveUsersSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('success', async () => {
      const req = {
        email: user.email,
        password: user.password,
      };

      const expectedUser = user;

      const expectedSession = {
        sessionId: uuidv4(),
        userId: user.userId,
        refreshToken: token,
        userAgent,
        clientIp,
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(expectedUser);

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'save')
        .mockResolvedValue(expectedSession);

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'signAsync')
        .mockResolvedValue(token);

      const result = await service.login(
        req.email,
        req.password,
        userAgent,
        clientIp,
      );

      expect(result.sessionId).toBe(expectedSession.sessionId);
      expect(result.accessToken).toBe(token);
      expect(result.refreshToken).toBe(token);
      expect(result.user.email).toEqual(expectedUser.email);
      expect(result.user.nickname).toEqual(expectedUser.nickname);
      expect(result.user.userId).toEqual(expectedUser.userId);
      expect(result.user.createdAt).toEqual(expectedUser.createdAt);
      expect(result.user.updatedAt).toEqual(expectedUser.updatedAt);

      saveUsersSpy.mockRestore();
      saveSessionsSpy.mockRestore();
      saveJwtSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        email: user.email,
        password: user.password,
      };

      const expectedError = new Error();

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(user);

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.login(req.email, req.password, userAgent, clientIp);
      }).rejects.toThrowError(new InternalServerErrorException());

      saveUsersSpy.mockRestore();
      saveSessionsSpy.mockRestore();
    });

    it('not found user', async () => {
      const req = {
        email: 'notFound@email.com',
        password: user.password,
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(null);

      await expect(async () => {
        await service.login(req.email, req.password, userAgent, clientIp);
      }).rejects.toThrowError(new NotFoundException('not found user'));

      saveUsersSpy.mockRestore();
    });

    it('invalid password', async () => {
      const req = {
        email: user.email,
        password: 'invalidPassword',
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(user);

      await expect(async () => {
        await service.login(req.email, req.password, userAgent, clientIp);
      }).rejects.toThrowError(new BadRequestException('wrong password'));

      saveUsersSpy.mockRestore();
    });
  });

  describe('renew access token', () => {
    it('success', async () => {
      const req = {
        refreshToken: token,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: user.userId,
        refreshToken: token,
        userAgent,
        clientIp,
      };

      const saveJwtSpy1 = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({
          id: expectedSession.sessionId,
          user_id: user.userId,
        });

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'findOne')
        .mockResolvedValue(expectedSession);

      const saveJwtSpy2 = jest
        .spyOn(mockJwtService, 'signAsync')
        .mockResolvedValue(token);

      const result = await service.renewAccessToken(req.refreshToken);

      expect(result.accessToken).toBe(token);

      saveJwtSpy1.mockRestore();
      saveSessionsSpy.mockRestore();
      saveJwtSpy2.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        refreshToken: token,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: user.userId,
        refreshToken: token,
        userAgent,
        clientIp,
      };

      const expectedError = new Error();

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({
          id: expectedSession.sessionId,
          user_id: user.userId,
        });

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'findOne')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.renewAccessToken(req.refreshToken);
      }).rejects.toThrowError(new InternalServerErrorException());

      saveJwtSpy.mockRestore();
      saveSessionsSpy.mockRestore();
    });

    it('invalid refresh token', async () => {
      const req = {
        refreshToken: token,
      };

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockRejectedValue(new Error());

      await expect(async () => {
        await service.renewAccessToken(req.refreshToken);
      }).rejects.toThrowError(new BadRequestException('invalid refresh token'));

      saveJwtSpy.mockRestore();
    });

    it('unauthorized refresh token', async () => {
      const req = {
        refreshToken: token,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: user.userId,
        refreshToken: 'invalid token',
        userAgent,
        clientIp,
      };

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({
          id: expectedSession.sessionId,
          user_id: user.userId,
        });

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'findOne')
        .mockResolvedValue(expectedSession);

      await expect(async () => {
        await service.renewAccessToken(req.refreshToken);
      }).rejects.toThrowError(new UnauthorizedException());

      saveJwtSpy.mockRestore();
      saveSessionsSpy.mockRestore();
    });

    it('unauthorized user', async () => {
      const req = {
        refreshToken: token,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: 0,
        refreshToken: 'invalid token',
        userAgent,
        clientIp,
      };

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({
          id: expectedSession.sessionId,
          user_id: user.userId,
        });

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'findOne')
        .mockResolvedValue(expectedSession);

      await expect(async () => {
        await service.renewAccessToken(req.refreshToken);
      }).rejects.toThrowError(new UnauthorizedException());

      saveJwtSpy.mockRestore();
      saveSessionsSpy.mockRestore();
    });

    it('is blocked', async () => {
      const req = {
        refreshToken: token,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: 0,
        refreshToken: 'invalid token',
        userAgent,
        clientIp,
        isBlocked: true,
      };

      const saveJwtSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({
          id: expectedSession.sessionId,
          user_id: user.userId,
        });

      const saveSessionsSpy = jest
        .spyOn(mockSessionsRepository, 'findOne')
        .mockResolvedValue(expectedSession);

      await expect(async () => {
        await service.renewAccessToken(req.refreshToken);
      }).rejects.toThrowError(new UnauthorizedException());

      saveJwtSpy.mockRestore();
      saveSessionsSpy.mockRestore();
    });
  });
});
