import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Chats } from './Chats';
import { ChatRoomUsers } from './ChatRoomUsers';

@Entity('chat_rooms', { schema: 'basic' })
export class ChatRooms {
  @PrimaryGeneratedColumn({ type: 'int', name: 'chat_room_id' })
  chatRoomId: number;

  @Column('varchar', { name: 'title', length: 50 })
  title: string;

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

  @OneToMany(() => Chats, (chats) => chats.chatRoom)
  chats: Chats[];

  @OneToMany(() => ChatRoomUsers, (chatRoomUsers) => chatRoomUsers.chatRoom)
  chatRoomUsers: ChatRoomUsers[];
}
