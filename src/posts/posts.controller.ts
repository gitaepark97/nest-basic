import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '../decorators/user.decorator';
import { CreatePostRequestDto } from './dto/createPost.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostResponseDto } from './dto/post.dto';

@ApiTags('POSTS')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '글 생성' })
  @ApiCreatedResponse({
    type: PostResponseDto,
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        examples: {
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
              message:
                'Cannot add or update a child row: a foreign key constraint fails (`basic`.`posts`, CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`))',
            },
          },
          notFoundCategory: {
            value: {
              message:
                'Cannot add or update a child row: a foreign key constraint fails (`basic`.`posts`, CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`))',
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
  @Post('')
  createPost(@User() user, @Body() body: CreatePostRequestDto) {
    return this.postsService.createPost(
      user.userId,
      body.categoryId,
      body.title,
      body.thumbnailImageUrl,
      body.description,
    );
  }
}
