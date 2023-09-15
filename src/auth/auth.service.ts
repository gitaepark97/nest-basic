import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import { generateHashPassword, generateSalt } from '../utils/password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async register(
    email: string,
    password: string,
    nickname: string,
  ): Promise<Users> {
    const salt = await generateSalt();
    const hashedPassword = await generateHashPassword(password, salt);

    try {
      const user = await this.usersRepository.save({
        email,
        hashedPassword,
        salt,
        nickname,
      });

      delete user.hashedPassword;
      delete user.salt;

      return user;
    } catch (err) {
      switch (err.code) {
        case 'ER_DUP_ENTRY':
          throw new BadRequestException(err.sqlMessage);
      }
      throw new InternalServerErrorException();
    }
  }
}
