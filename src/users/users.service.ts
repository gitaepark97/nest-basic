import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import { UpdateUserRequestDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getUser(userId: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId },
        relations: ['chatRoomUsers'],
      });
      if (!user) {
        throw new NotFoundException('not found user');
      }

      return user;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async updateUser(userId: number, updateUserReq: UpdateUserRequestDto) {
    try {
      await this.usersRepository.update(userId, updateUserReq);

      const user = await this.usersRepository.findOne({
        where: { userId },
      });
      if (!user) {
        throw new NotFoundException('not found user');
      }

      return user;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      switch (err.code) {
        case 'ER_DUP_ENTRY':
          throw new BadRequestException(err.sqlMessage);
      }

      throw new InternalServerErrorException();
    }
  }
}
