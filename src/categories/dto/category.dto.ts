import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Category {
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
