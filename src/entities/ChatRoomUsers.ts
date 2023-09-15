import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { ChatRooms } from './ChatRooms';

@Index('user_id', ['userId'], {})
@Entity('chat_room_users', { schema: 'basic' })
export class ChatRoomUsers {
  @Column('int', { primary: true, name: 'chat_room_id' })
  chatRoomId: number;

  @Column('int', { primary: true, name: 'user_id' })
  userId: number;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.chatRoomUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: Users;

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.chatRoomUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'chat_room_id', referencedColumnName: 'chatRoomId' }])
  chatRoom: ChatRooms;
}
