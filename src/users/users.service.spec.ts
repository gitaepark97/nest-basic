import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const mockUsersRepository = {
  update: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let user;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(Users), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    user = {
      email: 'test@email.com',
      nickname: 'test',
      password: 'password',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update user', () => {
    it('success', async () => {
      const req = {
        nickname: 'updatedTest',
      };

      const expectedUser = {
        ...user,
        nickname: req.nickname,
      };

      const saveUserSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(expectedUser);

      const result = await service.updateUser(user.user_id, req.nickname);

      expect(result.email).toEqual(expectedUser.email);
      expect(result.nickname).toEqual(expectedUser.nickname);
      expect(result.userId).toEqual(expectedUser.userId);
      expect(result.createdAt).toEqual(expectedUser.createdAt);
      expect(result.updatedAt).toEqual(expectedUser.updatedAt);

      saveUserSpy.mockRestore();
    });
  });

  it('internal server error', async () => {
    const req = {
      nickname: 'updatedTest',
    };

    const expectedError = new Error();

    const saveUsersSpy = jest
      .spyOn(mockUsersRepository, 'findOne')
      .mockRejectedValue(expectedError);

    await expect(async () => {
      await service.updateUser(user.user_id, req.nickname);
    }).rejects.toThrowError(new InternalServerErrorException());

    saveUsersSpy.mockRestore();
  });

  it('not found user', async () => {
    const req = {
      nickname: 'updatedTest',
    };

    const saveUsersSpy = jest
      .spyOn(mockUsersRepository, 'findOne')
      .mockResolvedValue(null);

    await expect(async () => {
      await service.updateUser(user.user_id, req.nickname);
    }).rejects.toThrowError(new NotFoundException('not found user'));

    saveUsersSpy.mockRestore();
  });

  it('duplicate nickname', async () => {
    const req = {
      nickname: 'duplicatedTest',
    };

    const expectedError = {
      code: 'ER_DUP_ENTRY',
      sqlMessage: "Duplicate entry 'test@email.com' for key 'email'",
    };

    const saveUsersSpy = jest
      .spyOn(mockUsersRepository, 'update')
      .mockRejectedValue(expectedError);

    await expect(async () => {
      await service.updateUser(user.user_id, req.nickname);
    }).rejects.toThrowError(new BadRequestException(expectedError.sqlMessage));

    saveUsersSpy.mockRestore();
  });
});
