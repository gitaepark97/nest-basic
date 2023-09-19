import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UpdateUserRequestDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../common/decorators/user.decorator';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../common/dto/user.dto';

@ApiTags('USERS')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '회원 정보 수정' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        examples: {
          duplicateNickname: {
            value: {
              message: "Duplicate entry 'test' for key 'nickname'",
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
  @ApiUnauthorizedResponse({
    content: {
      'application/json': {
        examples: {
          unauthorized: {
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
  @UseGuards(AuthGuard)
  @Patch('')
  updateUser(@User() user, @Body() body: UpdateUserRequestDto) {
    return this.usersService.updateUser(user.userId, body.nickname);
  }
}
