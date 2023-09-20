import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRooms } from '../entities/ChatRooms';
import { ChatRoomUsers } from '../entities/ChatRoomUsers';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRooms, ChatRoomUsers])],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
