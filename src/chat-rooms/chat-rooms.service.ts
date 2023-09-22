import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRooms } from '../entities/ChatRooms';
import { DataSource, Repository } from 'typeorm';
import { ChatRoomUsers } from '../entities/ChatRoomUsers';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly chatRoomsRepository: Repository<ChatRooms>,
    private dataSource: DataSource,
  ) {}

  async createChatRoom(userId: number, title: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      let chatRoomId;

      try {
        const { chatRoomId } = await queryRunner.manager.save(ChatRooms, {
          title,
        });
        await queryRunner.manager.save(ChatRoomUsers, { chatRoomId, userId });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      const chatRoom = await this.chatRoomsRepository.findOne({
        where: { chatRoomId },
        relations: ['chatRoomUsers'],
      });

      return chatRoom;
    } catch (err) {
      switch (err.code) {
        case 'ER_NO_REFERENCED_ROW_2':
          throw new NotFoundException(err.sqlMessage);
      }

      throw new InternalServerErrorException();
    }
  }

  async getChatRoomList() {
    try {
      const chatRoomList = await this.chatRoomsRepository.find({
        relations: ['chatRoomUsers'],
        order: { createdAt: 'DESC' },
      });

      return { list: chatRoomList };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
