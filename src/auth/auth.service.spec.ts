import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
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
};

const mockJwtService = {
  signAsync: jest.fn(),
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

      const saveSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockResolvedValue(user);

      const newUser = await service.register(
        req.email,
        req.password,
        req.nickname,
      );

      expect(newUser.email).toEqual(user.email);
      expect(newUser.nickname).toEqual(user.nickname);
      expect(newUser.userId).toEqual(user.userId);
      expect(newUser.createdAt).toEqual(user.createdAt);
      expect(newUser.updatedAt).toEqual(user.updatedAt);

      saveSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        email: user.email,
        password: user.password,
        nickname: user.nickname,
      };

      const expectedError = {
        code: 'ER_ACCESS_DENIED_ERROR',
        sqlMessage: 'Access denied. Check username and password.',
      };

      const saveSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(new InternalServerErrorException());

      saveSpy.mockRestore();
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

      const saveSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(
        new BadRequestException(expectedError.sqlMessage),
      );

      saveSpy.mockRestore();
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

      const saveSpy = jest
        .spyOn(mockUsersRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(
        new BadRequestException(expectedError.sqlMessage),
      );

      saveSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('success', async () => {
      const req = {
        email: user.email,
        password: user.password,
      };

      const expectedSession = {
        sessionId: uuidv4(),
        userId: user.userId,
        refreshToken: token,
        userAgent,
        clientIp,
      };

      const saveUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(user);

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

      expect(result.session_id).toBe(expectedSession.sessionId);
      expect(result.access_token).toBe(token);
      expect(result.refresh_token).toBe(token);
      expect(result.user.email).toEqual(user.email);
      expect(result.user.nickname).toEqual(user.nickname);
      expect(result.user.userId).toEqual(user.userId);
      expect(result.user.createdAt).toEqual(user.createdAt);
      expect(result.user.updatedAt).toEqual(user.updatedAt);

      saveUsersSpy.mockRestore();
      saveSessionsSpy.mockRestore();
      saveJwtSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        email: user.email,
        password: user.password,
      };

      const expectedError = {
        code: 'ER_ACCESS_DENIED_ERROR',
        sqlMessage: 'Access denied. Check username and password.',
      };

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
});
