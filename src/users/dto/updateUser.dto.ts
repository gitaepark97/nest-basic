import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({
    example: 'test',
    description: '닉네임',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nickname: string;
}
