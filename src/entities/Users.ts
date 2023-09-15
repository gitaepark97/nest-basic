import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sessions } from './Sessions';
import { Posts } from './Posts';
import { Chats } from './Chats';
import { ChatRoomUsers } from './ChatRoomUsers';

@Index('email', ['email'], { unique: true })
@Index('nickname', ['nickname'], { unique: true })
@Entity('users', { schema: 'basic' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @Column('varchar', { name: 'email', unique: true, length: 50 })
  email: string;

  @Column('varchar', { name: 'hashed_password', length: 255, select: false })
  hashedPassword: string;

  @Column('varchar', { name: 'salt', length: 255, select: false })
  salt: string;

  @Column('varchar', { name: 'nickname', unique: true, length: 50 })
  nickname: string;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Sessions, (sessions) => sessions.user)
  sessions: Sessions[];

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @OneToMany(() => Chats, (chats) => chats.user)
  chats: Chats[];

  @OneToMany(() => ChatRoomUsers, (chatRoomUsers) => chatRoomUsers.user)
  chatRoomUsers: ChatRoomUsers[];
}
