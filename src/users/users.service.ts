import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async updateUser(userId: number, nickname: string) {
    try {
      await this.usersRepository.update(userId, { nickname });
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
