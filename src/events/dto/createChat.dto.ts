import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChatRequestDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
