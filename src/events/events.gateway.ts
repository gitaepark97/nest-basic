import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAndHttpExceptionsFilter } from '../filters/ws-exception.filter';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { CreateChatRoomRequestDto } from './dto/createChatRoom.dto';

@WebSocketGateway({
  namespace: 'websocket',
  cors: '*',
  transport: ['websocket'],
})
@UseFilters(WsAndHttpExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsGateway implements OnGatewayConnection {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (!userId) {
      client.disconnect(true);
    }

    client.data.userId = userId;
  }

  @SubscribeMessage('CreateChatRoom')
  async handleCreateChatRoom(
    @ConnectedSocket() client,
    @MessageBody() body: CreateChatRoomRequestDto,
  ) {
    const result = await this.chatRoomsService.createChatRoom(
      client.data.userId,
      body.title,
    );

    const chatRoomList = await this.chatRoomsService.getChatRoomList();

    this.server.emit('CreateChatRoom', result);
    this.server.emit('ChatRoomList', chatRoomList);
  }
}
