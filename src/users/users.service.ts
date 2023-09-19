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

  async updateUser(user_id: number, nickname: string) {
    try {
      await this.usersRepository.update(user_id, { nickname });
      const user = await this.usersRepository.findOne({
        where: { userId: user_id },
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
