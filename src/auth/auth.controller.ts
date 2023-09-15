import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
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
          invalidEmail: {
            value: {
              message: ['email should not be empty', 'email must be an email'],
            },
          },
          invalidPassword: {
            value: {
              message: [
                'password should not be empty',
                'password must be a string',
              ],
            },
          },
          invalidNickname: {
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
  @Post('register')
  register(@Body() body: RegisterRequestDto) {
    return this.authService.register(body.email, body.password, body.nickname);
  }
}
