import {
  BadRequestException,
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAndHttpExceptionsFilter } from '../filters/ws-exception.filter';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { CreateChatRoomRequestDto } from './dto/createChatRoom.dto';
import { JoinChatRoomDto } from './dto/joinChatRoom.dto';
import { ChatRoomUsersService } from '../chat-room-users/chat-room-users.service';
import { UsersService } from 'src/users/users.service';
import { LeaveChatRoomDto } from './dto/leaveChatRoom.dto';

@WebSocketGateway({
  namespace: 'websocket',
  cors: '*',
  transport: ['websocket'],
})
@UseFilters(WsAndHttpExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly usersSerivce: UsersService,
    private readonly chatRoomsService: ChatRoomsService,
    private readonly chatRoomUsersService: ChatRoomUsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const userId = parseInt(<string>client.handshake.query.userId);
      if (!userId) {
        throw new UnauthorizedException();
      }

      client.data.userId = userId;
      client.data.chatRoomIdList = [];

      const user = await this.usersSerivce.getUser(userId);
      user.chatRoomUsers.forEach((chatRoomUser) => {
        client.join(String(chatRoomUser.chatRoomId));
        client.data.chatRoomIdList.push(chatRoomUser.chatRoomId);
      });
    } catch (err) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data.userId;
      const promiseList = [];

      const user = await this.usersSerivce.getUser(userId);
      user.chatRoomUsers.forEach(async (chatRoomUser) => {
        promiseList.push(
          this.chatRoomUsersService.deleteChatRoomUser(
            chatRoomUser.chatRoomId,
            userId,
          ),
        );
      });

      Promise.all(promiseList);
    } catch (err) {
      client.disconnect(true);
    }
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

    this.server.emit('CreateChatRoom', result);

    const chatRoomList = await this.chatRoomsService.getChatRoomList();

    this.server.emit('ChatRoomList', chatRoomList);
  }

  @SubscribeMessage('GetChatRoomList')
  async handleGetChatRoomList(@ConnectedSocket() Client) {
    const chatRoomList = await this.chatRoomsService.getChatRoomList();

    Client.emit('ChatRoomList', chatRoomList);
  }

  @SubscribeMessage('JoinChatRoom')
  async handleJoinChatRoom(
    @ConnectedSocket() client,
    @MessageBody() body: JoinChatRoomDto,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const chatRoomId = body.chatRoomId;
    const strChatRoomId = String(chatRoomId);

    const chatRoomUser = await this.chatRoomUsersService.createChatRoomUser(
      chatRoomId,
      userId,
    );

    client.join(strChatRoomId);
    client.data.chatRoomIdList.push(chatRoomId);

    this.server.to(strChatRoomId).emit('JoinChatRoom', chatRoomUser);

    const chatRoomList = await this.chatRoomsService.getChatRoomList();

    this.server.emit('ChatRoomList', chatRoomList);
  }

  @SubscribeMessage('LeaveChatRoom')
  async handleLeaveChatRoom(
    @ConnectedSocket() client,
    @MessageBody() body: LeaveChatRoomDto,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const chatRoomId = body.chatRoomId;
    if (!chatRoomId) {
      throw new BadRequestException('join chat room first');
    }
    const strChatRoomId = String(chatRoomId);

    await this.chatRoomUsersService.deleteChatRoomUser(chatRoomId, userId);

    client.leave(strChatRoomId);
    client.data.chatRoomIdList = client.data.chatRoomIdList.filter(
      (existChatRoomId) => existChatRoomId !== chatRoomId,
    );

    client.emit('LeaveChatRoom', { chatRoomId, userId });
    this.server.to(strChatRoomId).emit('LeaveChatRoom', { chatRoomId, userId });

    const chatRoomList = await this.chatRoomsService.getChatRoomList();

    this.server.emit('ChatRoomList', chatRoomList);
  }
}
