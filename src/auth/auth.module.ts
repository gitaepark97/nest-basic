import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Sessions } from '../entities/Sessions';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Sessions]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secrets = configService.get('jwt');
        return {
          secret: secrets.secret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
