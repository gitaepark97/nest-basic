import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockAuthRepository = {
  save: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Users), useValue: mockAuthRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('success', async () => {
      const req = {
        email: 'test@email.com',
        password: 'password',
        nickname: 'test',
      };

      const expectedUser = {
        email: req.email,
        hashedPassword: 'hashedPassword',
        salt: 'salt',
        nickname: req.nickname,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const saveSpy = jest
        .spyOn(mockAuthRepository, 'save')
        .mockResolvedValue(expectedUser);

      const user = await service.register(
        req.email,
        req.password,
        req.nickname,
      );

      expect(user.email).toEqual(expectedUser.email);
      expect(user.nickname).toEqual(expectedUser.nickname);
      expect(user.userId).toEqual(expectedUser.userId);
      expect(user.createdAt).toEqual(expectedUser.createdAt);
      expect(user.updatedAt).toEqual(expectedUser.updatedAt);

      saveSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        email: 'test@email.com',
        password: 'password',
        nickname: 'test',
      };

      const expectedError = {
        code: 'ER_ACCESS_DENIED_ERROR',
        sqlMessage: 'Access denied. Check username and password.',
      };

      const saveSpy = jest
        .spyOn(mockAuthRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(new InternalServerErrorException());

      saveSpy.mockRestore();
    });

    it('duplicate email', async () => {
      const req = {
        email: 'test@email.com',
        password: 'password',
        nickname: 'test',
      };

      const expectedError = {
        code: 'ER_DUP_ENTRY',
        sqlMessage: "Duplicate entry 'test@email.com' for key 'email'",
      };

      const saveSpy = jest
        .spyOn(mockAuthRepository, 'save')
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
        email: 'test@email.com',
        password: 'password',
        nickname: 'test',
      };

      const expectedError = {
        code: 'ER_DUP_ENTRY',
        sqlMessage: "Duplicate entry 'test' for key 'nickname'",
      };

      const saveSpy = jest
        .spyOn(mockAuthRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.register(req.email, req.password, req.nickname);
      }).rejects.toThrowError(
        new BadRequestException(expectedError.sqlMessage),
      );

      saveSpy.mockRestore();
    });
  });
});
