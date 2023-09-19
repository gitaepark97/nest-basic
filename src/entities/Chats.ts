import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRooms } from './ChatRooms';
import { Users } from './Users';

@Index('chat_room_id', ['chatRoomId'], {})
@Index('user_id', ['userId'], {})
@Entity('chats', { schema: 'basic' })
export class Chats {
  @PrimaryGeneratedColumn({ type: 'int', name: 'chat_id' })
  chatId: number;

  @Column('int', { name: 'chat_room_id' })
  chatRoomId: number;

  @Column('int', { name: 'user_id', nullable: true })
  userId: number | null;

  @Column('text', { name: 'content' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.chats, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'chat_room_id', referencedColumnName: 'chatRoomId' }])
  chatRoom: ChatRooms;

  @ManyToOne(() => Users, (users) => users.chats, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: Users;
}
