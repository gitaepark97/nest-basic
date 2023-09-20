import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../entities/Posts';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
  ) {}

  async createPost(
    userId: number,
    categoryId: number,
    title: string,
    thumbnailImageUrl: string,
    description: string,
  ) {
    try {
      const { postId } = await this.postsRepository.save({
        userId,
        categoryId,
        title,
        thumbnailImageUrl,
        description,
      });

      const post = await this.postsRepository.findOne({
        where: { postId: postId },
        relations: ['user', 'category'],
      });

      return post;
    } catch (err) {
      switch (err.code) {
        case 'ER_NO_REFERENCED_ROW_2':
          throw new NotFoundException(err.sqlMessage);
      }

      throw new InternalServerErrorException();
    }
  }
}
