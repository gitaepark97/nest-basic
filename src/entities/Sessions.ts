import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';

@Index('user_id', ['userId'], {})
@Entity('sessions', { schema: 'basic' })
export class Sessions {
  @Column('char', { primary: true, name: 'session_id', length: 36 })
  sessionId: string;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('varchar', { name: 'refresh_token', length: 255 })
  refreshToken: string;

  @Column('varchar', { name: 'user_agent', length: 255 })
  userAgent: string;

  @Column('varchar', { name: 'client_ip', length: 255 })
  clientIp: string;

  @Column('tinyint', { name: 'is_blocked', width: 1, default: () => "'0'" })
  isBlocked: boolean;

  @Column('timestamp', { name: 'expired_at' })
  expiredAt: Date;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.sessions, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: Users;
}
