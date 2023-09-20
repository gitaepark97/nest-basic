import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.dto';

export class GetCategoriesResponseDto {
  @ApiProperty({
    example: [
      {
        categoryId: 1,
        title: '카테고리1',
      },
    ],
    description: '카테고리 목록',
  })
  list: Category[] | [];
}
