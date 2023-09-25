import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { ChatRoomUsersModule } from '../chat-room-users/chat-room-users.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, ChatRoomsModule, ChatRoomUsersModule],
  providers: [EventsGateway],
})
export class EventsModule {}
