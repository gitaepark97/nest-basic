import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Category } from '../../categories/dto/category.dto';
import { UserResponseDto } from '../../users/dto/user.dto';

export class PostResponseDto {
  @ApiProperty({
    example: 1,
    description: '글 ID',
  })
  @IsNumber()
  @IsNotEmpty()
  postId: number;

  @ApiProperty({
    example: 1,
    description: '회원 ID',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

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

  @ApiProperty({
    example: '0000-00-00T00:00:00.000Z',
    description: '생성 시간',
  })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({
    example: '0000-00-00T00:00:00.000Z',
    description: '수정 시간',
  })
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @ApiProperty({
    example: {
      userId: 1,
      email: 'test@email.com',
      nickname: 'test',
      createdAt: '0000-00-00T00:00:00.000Z',
      updatedAt: '0000-00-00T00:00:00.000Z',
    },
    description: '회원 정보',
  })
  @IsNotEmpty()
  user: UserResponseDto;

  @ApiProperty({
    example: {
      categoryId: 1,
      title: 'post',
    },
    description: '카테고리',
  })
  @IsNotEmpty()
  category: Category;
}
