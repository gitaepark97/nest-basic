import {
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

  async createChatRoomUser(chatRoomId: number, userId: number) {
    try {
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
      await this.chatRoomUsersRepository.delete({ chatRoomId, userId });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async validateChatRoomUser(chatRoomId: number, userId: number) {
    try {
      await this.chatRoomUsersRepository.findOneOrFail({
        where: { chatRoomId, userId },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
