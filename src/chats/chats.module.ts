import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chats } from '../entities/Chats';
import { ChatRoomUsersModule } from '../chat-room-users/chat-room-users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chats]), ChatRoomUsersModule],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
