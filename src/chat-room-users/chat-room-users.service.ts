import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoomUsers } from '../entities/ChatRoomUsers';
import { ChatRooms } from '../entities/ChatRooms';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ChatRoomUsersService {
  constructor(
    @InjectRepository(ChatRoomUsers)
    private readonly chatRoomUsersRepository: Repository<ChatRoomUsers>,
    private readonly dataSource: DataSource,
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
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.delete(ChatRoomUsers, { chatRoomId, userId });

        const count = (
          await queryRunner.manager.findAndCount(ChatRoomUsers, {
            where: { chatRoomId },
          })
        )[1];
        if (count === 0) {
          await queryRunner.manager.delete(ChatRooms, { chatRoomId });
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
