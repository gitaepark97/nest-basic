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
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAndHttpExceptionsFilter } from '../filters/ws-exception.filter';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { CreateChatRoomRequestDto } from './dto/createChatRoom.dto';
import { JoinChatRoomRequestDto } from './dto/joinChatRoom.dto';
import { ChatRoomUsersService } from '../chat-room-users/chat-room-users.service';
import { UsersService } from '../users/users.service';
import { LeaveChatRoomDto } from './dto/leaveChatRoom.dto';
import { CreateChatRequestDto } from './dto/createChat.dto';
import { ChatsService } from '../chats/chats.service';

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
    private readonly chatsService: ChatsService,
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

      const user = await this.usersSerivce.getUser(userId);
      user.chatRoomUsers.forEach((chatRoomUser) => {
        client.join(String(chatRoomUser.chatRoomId));
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
    try {
      const result = await this.chatRoomsService.createChatRoom(
        client.data.userId,
        body.title,
      );

      this.server.emit('CreateChatRoom', result);

      const chatRoomList = await this.chatRoomsService.getChatRoomList();

      this.server.emit('ChatRoomList', chatRoomList);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('GetChatRoomList')
  async handleGetChatRoomList(@ConnectedSocket() Client) {
    try {
      const chatRoomList = await this.chatRoomsService.getChatRoomList();

      Client.emit('ChatRoomList', chatRoomList);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('JoinChatRoom')
  async handleJoinChatRoom(
    @ConnectedSocket() client,
    @MessageBody() body: JoinChatRoomRequestDto,
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        throw new UnauthorizedException();
      }

      const chatRoomId = String(body.chatRoomId);

      const chatRoomUser = await this.chatRoomUsersService.createChatRoomUser(
        body.chatRoomId,
        userId,
      );

      client.join(chatRoomId);

      this.server.in(chatRoomId).emit('JoinChatRoom', chatRoomUser);

      const chatRoomList = await this.chatRoomsService.getChatRoomList();

      this.server.emit('ChatRoomList', chatRoomList);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('LeaveChatRoom')
  async handleLeaveChatRoom(
    @ConnectedSocket() client,
    @MessageBody() body: LeaveChatRoomDto,
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        throw new UnauthorizedException();
      }

      const chatRoomId = String(body.chatRoomId);
      if (!chatRoomId) {
        throw new BadRequestException('join chat room first');
      }

      await this.chatRoomUsersService.deleteChatRoomUser(
        body.chatRoomId,
        userId,
      );

      client.leave(chatRoomId);

      client.emit('LeaveChatRoom', { chatRoomId, userId });
      this.server.in(chatRoomId).emit('LeaveChatRoom', { chatRoomId, userId });

      const chatRoomList = await this.chatRoomsService.getChatRoomList();

      this.server.emit('ChatRoomList', chatRoomList);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('SendChat')
  async handleCreateChat(
    @ConnectedSocket() client,
    @MessageBody() body: CreateChatRequestDto,
  ) {
    try {
      const userId = client.data.userId;

      await this.chatRoomUsersService.validateChatRoomUser(
        body.chatRoomId,
        userId,
      );

      const chat = await this.chatsService.createChat(
        body.chatRoomId,
        userId,
        body.content,
      );

      this.server.to(String(body.chatRoomId)).emit('Chat', chat);
    } catch (err) {
      throw new WsException(err);
    }
  }

  @SubscribeMessage('GetChatList')
  async handleGetChatList(
    @ConnectedSocket() client,
    @MessageBody() body: CreateChatRequestDto,
  ) {
    try {
      const userId = client.data.userId;

      const chatList = await this.chatsService.getChatList(
        body.chatRoomId,
        userId,
      );
      console.log(chatList);

      client.emit('ChatList', chatList);
    } catch (err) {
      throw new WsException(err);
    }
  }
}
