import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '../decorators/user.decorator';
import { CreatePostRequestDto } from './dto/createPost.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostResponseDto } from './dto/post.dto';
import { GetPostListResponseDto } from './dto/getPostList.dto';
import { UpdatePostRequestDto } from './dto/updatePost.dto';

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
@ApiTags('POSTS')
@UseGuards(AuthGuard)
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

  @ApiOperation({ summary: '글 목록 조회' })
  @ApiOkResponse({
    type: GetPostListResponseDto,
  })
  @Get('')
  getPostList(
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ) {
    return this.postsService.getPostList(take, skip);
  }

  @ApiOperation({ summary: '글 조회' })
  @ApiOkResponse({
    type: PostResponseDto,
  })
  @ApiNotFoundResponse({
    content: {
      'application/json': {
        examples: {
          notFoundPost: {
            value: {
              message: 'not found post',
            },
          },
        },
      },
    },
  })
  @Get(':postId')
  getPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPost(postId);
  }

  @ApiOperation({ summary: '글 수정' })
  @ApiOkResponse({
    type: PostResponseDto,
  })
  @ApiForbiddenResponse({
    content: {
      'application/json': {
        examples: {
          forbidden: {
            value: {
              message: 'Forbidden',
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
          notFoundPost: {
            value: {
              message: 'not found post',
            },
          },
        },
      },
    },
  })
  @Patch(':postId')
  updatePost(
    @User() user,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: UpdatePostRequestDto,
  ) {
    return this.postsService.updatePost(user.userId, postId, body);
  }

  @ApiOperation({ summary: '글 삭제' })
  @ApiOkResponse()
  @ApiForbiddenResponse({
    content: {
      'application/json': {
        examples: {
          forbidden: {
            value: {
              message: 'Forbidden',
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
          notFoundPost: {
            value: {
              message: 'not found post',
            },
          },
        },
      },
    },
  })
  @Delete(':postId')
  deletePost(@User() user, @Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.deletePost(user.userId, postId);
  }
}
