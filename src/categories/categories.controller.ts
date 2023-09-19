import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetCategoriesResponseDto as GetCategoryListResponseDto } from './dto/getCategoryList.dto';

@ApiTags('CATEGORIES')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiOkResponse({
    type: GetCategoryListResponseDto,
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
  @Get('')
  getCategoryList() {
    return this.categoriesService.getCategoryList();
  }
}
