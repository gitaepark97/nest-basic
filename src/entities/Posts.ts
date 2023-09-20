import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './Users';
import { Categories } from './Categories';

@Index('title', ['title'], {})
@Index('user_id', ['userId'], {})
@Index('category_id', ['categoryId'], {})
@Entity('posts', { schema: 'basic' })
export class Posts {
  @PrimaryGeneratedColumn({ type: 'int', name: 'post_id' })
  postId: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'category_id' })
  categoryId: number;

  @Column('varchar', { name: 'title', length: 255 })
  title: string;

  @Column('varchar', { name: 'thumbnail_image_url', length: 255 })
  thumbnailImageUrl: string;

  @Column('text', { name: 'description' })
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', select: false })
  deletedAt: Date;

  @ManyToOne(() => Users, (users) => users.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: Users;

  @ManyToOne(() => Categories, (categories) => categories.posts, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'categoryId' }])
  category: Categories;
}
