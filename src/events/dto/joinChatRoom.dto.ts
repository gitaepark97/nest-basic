import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinChatRoomRequestDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}
