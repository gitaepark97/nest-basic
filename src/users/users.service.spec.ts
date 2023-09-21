import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  createRandomEmail,
  createRandomInt,
  createRandomString,
} from '../../test/utils/random';

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
      userId: createRandomInt(1, 10),
      email: createRandomEmail(),
      nickname: createRandomString(15),
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
        updatedAt: new Date(),
      };

      const findOneUsersSpy = jest
        .spyOn(mockUsersRepository, 'findOne')
        .mockResolvedValue(expectedUser);

      const result = await service.updateUser(user.userId, req);

      expect(result.email).toBe(expectedUser.email);
      expect(result.nickname).toBe(expectedUser.nickname);
      expect(result.userId).toBe(expectedUser.userId);
      expect(result.createdAt).toEqual(expectedUser.createdAt);
      expect(result.updatedAt).toEqual(expectedUser.updatedAt);

      findOneUsersSpy.mockRestore();
    });
  });

  it('internal server error', async () => {
    const req = {
      nickname: createRandomString(15),
    };

    const expectedError = new Error();

    const findOneUsersSpy = jest
      .spyOn(mockUsersRepository, 'findOne')
      .mockRejectedValue(expectedError);

    await expect(async () => {
      await service.updateUser(user.userId, req);
    }).rejects.toThrowError(new InternalServerErrorException());

    findOneUsersSpy.mockRestore();
  });

  it('not found user', async () => {
    const req = {
      nickname: 'updatedTest',
    };

    const findOneUsersSpy = jest
      .spyOn(mockUsersRepository, 'findOne')
      .mockResolvedValue(null);

    await expect(async () => {
      await service.updateUser(0, req);
    }).rejects.toThrowError(new NotFoundException('not found user'));

    findOneUsersSpy.mockRestore();
  });

  it('duplicate nickname', async () => {
    const req = {
      nickname: 'duplicatedTest',
    };

    const expectedError = {
      code: 'ER_DUP_ENTRY',
      sqlMessage: "Duplicate entry 'test@email.com' for key 'email'",
    };

    const updateUsersSpy = jest
      .spyOn(mockUsersRepository, 'update')
      .mockRejectedValue(expectedError);

    await expect(async () => {
      await service.updateUser(user.userId, req);
    }).rejects.toThrowError(new BadRequestException(expectedError.sqlMessage));

    updateUsersSpy.mockRestore();
  });
});
