import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import {
  generateHashPassword,
  generateSalt,
  validatePassword,
} from '../utils/password';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Sessions } from '../entities/Sessions';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Sessions)
    private readonly sessionssRepository: Repository<Sessions>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    nickname: string,
  ): Promise<Users> {
    try {
      const salt = await generateSalt();
      const hashedPassword = await generateHashPassword(password, salt);

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

  async login(
    email: string,
    password: string,
    user_agent: string,
    client_ip: string,
  ) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        select: [
          'userId',
          'email',
          'hashedPassword',
          'salt',
          'nickname',
          'createdAt',
          'updatedAt',
        ],
      });
      if (!user) {
        throw new NotFoundException('not found user');
      }

      if (!(await validatePassword(password, user.hashedPassword, user.salt))) {
        throw new BadRequestException('wrong password');
      }

      const accessPayload = { user_id: user.userId, nickname: user.nickname };
      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      });

      const refreshPayload = { id: uuidv4(), user_id: user.userId };
      const refreshToken = await this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      });

      const session = await this.sessionssRepository.save({
        sessionId: refreshPayload.id,
        refreshToken,
        userId: user.userId,
        userAgent: user_agent,
        clientIp: client_ip,
      });

      delete user.hashedPassword;
      delete user.salt;

      return {
        session_id: session.sessionId,
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      console.log(err);

      throw new InternalServerErrorException();
    }
  }
}
