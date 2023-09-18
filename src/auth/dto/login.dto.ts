import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserResponseDto } from './register.dto';

export class LoginRequestDto {
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
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'c94249c1-c624-44ad-ad49-db2411463290',
    description: '세션 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJuaWNrbmFtZSI6InRlc3QxIiwiaWF0IjoxNjk1MDI1MDA3LCJleHAiOjE2OTUwMjg2MDd9.qh5V5oSPz6e3hES3f2pYOIB6kErBaDVGGtFw1nqVo3Y',
    description: '액세스 토큰',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM5NDI0OWMxLWM2MjQtNDRhZC1hZDQ5LWRiMjQxMTQ2MzI5MCIsInVzZXJfaWQiOjEsImlhdCI6MTY5NTAyNTAwNywiZXhwIjoxNjk2MjM0NjA3fQ.HPHQODY0Kr_o7QPVy8VJ4XcXjL74zcKj08rmRn2VK4E',
    description: '리프레쉬 토큰',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  user: UserResponseDto;
}
