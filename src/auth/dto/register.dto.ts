import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'test@email.com',
    description: '이메일',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password',
    description: '비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'test',
    description: '닉네임',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nickname: string;
}
