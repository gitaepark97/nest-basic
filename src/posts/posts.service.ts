import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../entities/Posts';
import { Repository } from 'typeorm';
import { UpdatePostRequestDto } from './dto/updatePost.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
  ) {}

  private async validatePostUser(userId: number, postId: number) {
    const post = await this.postsRepository.findOne({
      where: { postId },
    });
    if (!post) {
      throw new NotFoundException('not found post');
    }

    if (userId !== post.userId) {
      throw new ForbiddenException();
    }
  }

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

  async getPostList(take: number, skip: number) {
    try {
      const [postList, count] = await this.postsRepository.findAndCount({
        relations: ['user', 'category'],
        take,
        skip,
      });

      return { list: postList, count };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getPost(postId: number) {
    try {
      const post = await this.postsRepository.findOne({
        where: { postId },
        relations: ['user', 'category'],
      });
      if (!post) {
        throw new NotFoundException('not found post');
      }

      return post;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async updatePost(
    userId: number,
    postId: number,
    updatePostReq: UpdatePostRequestDto,
  ) {
    try {
      await this.validatePostUser(userId, postId);

      await this.postsRepository.update(postId, updatePostReq);

      const updatedPost = await this.postsRepository.findOne({
        where: { postId },
        relations: ['user', 'category'],
      });

      return updatedPost;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async deletePost(userId: number, postId: number) {
    try {
      await this.validatePostUser(userId, postId);

      await this.postsRepository.softDelete(postId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
