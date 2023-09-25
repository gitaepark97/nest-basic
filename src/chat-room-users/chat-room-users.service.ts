import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoomUsers } from '../entities/ChatRoomUsers';
import { Repository } from 'typeorm';

@Injectable()
export class ChatRoomUsersService {
  constructor(
    @InjectRepository(ChatRoomUsers)
    private readonly chatRoomUsersRepository: Repository<ChatRoomUsers>,
  ) {}

  async validateChatRoomUser(chatRoomId: number, userId: number) {
    try {
      const chatRoomUser = await this.chatRoomUsersRepository.findOne({
        where: { chatRoomId, userId },
      });

      return chatRoomUser ? true : false;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async createChatRoomUser(chatRoomId: number, userId: number) {
    try {
      if (await this.validateChatRoomUser(chatRoomId, userId)) {
        throw new BadRequestException('already in chat room');
      }

      const chatRoomUser = await this.chatRoomUsersRepository.save({
        chatRoomId,
        userId,
      });

      return chatRoomUser;
    } catch (err) {
      switch (err.code) {
        case 'ER_NO_REFERENCED_ROW_2':
          throw new NotFoundException(err.sqlMessage);
      }

      throw new InternalServerErrorException();
    }
  }

  async deleteChatRoomUser(chatRoomId: number, userId: number) {
    try {
      if (!(await this.validateChatRoomUser(chatRoomId, userId))) {
        throw new BadRequestException('join chat room first');
      }

      await this.chatRoomUsersRepository.delete({ chatRoomId, userId });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
