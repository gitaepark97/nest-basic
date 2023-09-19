import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Posts } from './Posts';

@Index('title', ['title'], { unique: true })
@Entity('categories', { schema: 'basic' })
export class Categories {
  @PrimaryGeneratedColumn({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column('varchar', { name: 'title', unique: true, length: 50 })
  title: string;

  @Column('int', { name: 'parent_category_id', nullable: true })
  parentCategoryId: number | null;

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

  @OneToMany(() => Posts, (posts) => posts.category)
  posts: Posts[];
}
