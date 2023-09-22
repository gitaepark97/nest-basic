import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Sessions } from '../entities/Sessions';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

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
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

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
          'nickname',
          'createdAt',
          'updatedAt',
        ],
      });
      if (!user) {
        throw new NotFoundException('not found user');
      }

      if (!(await bcrypt.compare(password, user.hashedPassword))) {
        throw new BadRequestException('wrong password');
      }

      const accessPayload = { userId: user.userId };
      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      });

      const refreshPayload = { id: uuidv4(), userId: user.userId };
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

      return {
        sessionId: session.sessionId,
        accessToken,
        refreshToken,
        user,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async renewAccessToken(refreshToken: string) {
    try {
      let refreshTokenPayload;
      try {
        refreshTokenPayload = await this.jwtService.verifyAsync(refreshToken);
      } catch (err) {
        throw new BadRequestException('invalid refresh token');
      }

      const session = await this.sessionssRepository.findOne({
        where: { sessionId: refreshTokenPayload.id },
      });
      if (!session) {
        throw new NotFoundException('not found session');
      }

      if (refreshToken !== session.refreshToken) {
        throw new UnauthorizedException();
      }
      if (session.userId !== refreshTokenPayload.userId) {
        throw new UnauthorizedException();
      }
      if (session.isBlocked) {
        throw new UnauthorizedException();
      }

      const accessPayload = { user_id: refreshTokenPayload.userId };
      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      });

      return { accessToken };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
