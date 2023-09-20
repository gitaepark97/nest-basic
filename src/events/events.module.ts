import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';

@Module({
  imports: [ChatRoomsModule],
  providers: [EventsGateway],
})
export class EventsModule {}
