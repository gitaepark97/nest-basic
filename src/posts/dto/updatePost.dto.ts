import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostRequestDto {
  @ApiProperty({
    example: 1,
    description: '카테고리 ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    example: 'post title',
    description: '글 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: 'post thumnail image url',
    description: '썸네일 이미지 URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  thumbnailImageUrl?: string;

  @ApiProperty({
    example: 'post description',
    description: '글',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
