import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoomUsersService } from '../chat-room-users/chat-room-users.service';
import { Chats } from '../entities/Chats';
import { Repository } from 'typeorm';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chats)
    private readonly chatsRepository: Repository<Chats>,
    private readonly chatRoomUsersService: ChatRoomUsersService,
  ) {}

  createChat(chatRoomId: number, userId: number, content: string) {
    return this.chatsRepository.save({ chatRoomId, userId, content });
  }

  async getChatList(chatRoomId: number, userId: number) {
    await this.chatRoomUsersService.validateChatRoomUser(chatRoomId, userId);

    const chatList = await this.chatsRepository
      .createQueryBuilder('chats')
      .innerJoin('chats.user', 'users')
      .innerJoin('users.chatRoomUsers', 'chatRoomUsers')
      .where('chats.chatRoomId = :chatRoomId', { chatRoomId })
      .andWhere('chats.createdAt > chatRoomUsers.createdAt')
      .orderBy('chats.createdAt', 'DESC')
      .getMany();

    return { list: chatList };
  }
}
