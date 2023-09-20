import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePostRequestDto {
  @ApiProperty({
    example: 1,
    description: '카테고리 ID',
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    example: 'post title',
    description: '글 제목',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'post thumnail image url',
    description: '썸네일 이미지 URL',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  thumbnailImageUrl: string;

  @ApiProperty({
    example: 'post description',
    description: '글',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
