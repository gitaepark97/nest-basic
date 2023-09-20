import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import {
  RenewAccessTokenRequestDto,
  RenewAccessTokenResponseDto,
} from './dto/renewAccessToken.dto';
import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        examples: {
          duplicateEmail: {
            value: {
              message: "Duplicate entry 'test@email.com' for key 'email'",
            },
          },
          duplicateNickname: {
            value: {
              message: "Duplicate entry 'test' for key 'nickname'",
            },
          },
          invalidEmailParameter: {
            value: {
              message: ['email should not be empty', 'email must be an email'],
            },
          },
          invalidPasswordParameter: {
            value: {
              message: [
                'password should not be empty',
                'password must be a string',
              ],
            },
          },
          invalidNicknameParameter: {
            value: {
              message: [
                'nickname must be shorter than or equal to 50 characters',
                'nickname should not be empty',
                'nickname must be a string',
              ],
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    content: {
      'application/json': {
        examples: {
          internalServerError: {
            value: {
              message: 'Internal Server Error',
            },
          },
        },
      },
    },
  })
  @Post('register')
  register(@Body() body: RegisterRequestDto) {
    return this.authService.register(body.email, body.password, body.nickname);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiCreatedResponse({
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        examples: {
          notFoundUser: {
            value: {
              message: 'not found user',
            },
          },
          wrongPassword: {
            value: {
              message: 'wrong password',
            },
          },
          invalidEmailParameter: {
            value: {
              message: ['email should not be empty', 'email must be an email'],
            },
          },
          invalidPasswordParameter: {
            value: {
              message: [
                'password should not be empty',
                'password must be a string',
              ],
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    content: {
      'application/json': {
        examples: {
          notFoundUser: {
            value: {
              message: 'not found user',
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    content: {
      'application/json': {
        examples: {
          internalServerError: {
            value: {
              message: 'Internal Server Error',
            },
          },
        },
      },
    },
  })
  @Post('login')
  login(@Req() req, @Body() body: LoginRequestDto) {
    const userAgent = req.headers['user-agent'];
    const clientIp = req.ip;

    return this.authService.login(
      body.email,
      body.password,
      userAgent,
      clientIp,
    );
  }

  @ApiOperation({ summary: '액세스 토큰 재발급' })
  @ApiCreatedResponse({
    type: RenewAccessTokenResponseDto,
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        examples: {
          invalidRefreshToken: {
            value: {
              message: 'invalid refresh token',
            },
          },
          invalidRefreshTokenParameter: {
            value: {
              message: [
                'refreshToken should not be empty',
                'refreshToken must be a string',
              ],
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    content: {
      'application/json': {
        examples: {
          unauthorizedToken: {
            value: {
              message: 'Unauthorized',
            },
          },
          unauthorizedUser: {
            value: {
              message: 'Unauthorized',
            },
          },
          isBlocked: {
            value: {
              message: 'Unauthorized',
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    content: {
      'application/json': {
        examples: {
          notFoundSession: {
            value: {
              message: 'not found session',
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    content: {
      'application/json': {
        examples: {
          internalServerError: {
            value: {
              message: 'Internal Server Error',
            },
          },
        },
      },
    },
  })
  @Post('renew-access-token')
  renewAccessToken(@Body() body: RenewAccessTokenRequestDto) {
    return this.authService.renewAccessToken(body.refreshToken);
  }
}
