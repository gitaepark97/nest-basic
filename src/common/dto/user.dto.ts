import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    example: 'test@email.com',
    description: '이메일',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'test',
    description: '닉네임',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nickname: string;

  @ApiProperty({
    example: 1,
    description: '회원 ID',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: '0000-00-00T00:00:00.000Z',
    description: '회원 ID',
  })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({
    example: '0000-00-00T00:00:00.000Z',
    description: '회원 ID',
  })
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
