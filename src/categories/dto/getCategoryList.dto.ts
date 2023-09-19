import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

class Category {
  @ApiProperty({
    example: 1,
    description: '카테고리 ID',
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    example: '카테고리1',
    description: '카테고리명',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
