import { Module } from '@nestjs/common';
import { ChatRoomUsersService } from './chat-room-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomUsers } from '../entities/ChatRoomUsers';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoomUsers])],
  providers: [ChatRoomUsersService],
  exports: [ChatRoomUsersService],
})
export class ChatRoomUsersModule {}
