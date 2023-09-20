import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatRoomRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
