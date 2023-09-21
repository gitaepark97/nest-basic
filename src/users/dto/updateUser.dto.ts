import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({
    example: 'test',
    description: '닉네임',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(50)
  nickname?: string;
}
