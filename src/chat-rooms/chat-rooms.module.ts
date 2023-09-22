import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRooms } from '../entities/ChatRooms';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRooms])],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
