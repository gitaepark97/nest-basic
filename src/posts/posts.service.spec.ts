import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Posts } from '../entities/Posts';
import {
  createRandomEmail,
  createRandomInt,
  createRandomString,
} from '../../test/utils/random';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const mockPostsRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;
  let user;
  let category;
  let post;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Posts), useValue: mockPostsRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);

    user = {
      userId: createRandomInt(1, 10),
      email: createRandomEmail(),
      nickname: createRandomString(15),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    category = {
      categoryId: createRandomInt(1, 6),
      title: createRandomString(10),
    };

    post = {
      postId: createRandomInt(1, 10),
      userId: user.userId,
      categoryId: category.categoryId,
      title: createRandomString(10),
      thumbnailImageUrl: createRandomString(50),
      description: createRandomString(100),
      createdAt: new Date(),
      updatedAt: new Date(),
      user,
      category,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create post (POST)', () => {
    it('success', async () => {
      const req = {
        categoryId: post.category.categoryId,
        title: post.title,
        thumbnailImageUrl: post.thumbnailImageUrl,
        description: post.description,
      };

      const expectedPost = post;

      const savePostsSpy = jest
        .spyOn(mockPostsRepository, 'save')
        .mockResolvedValue(expectedPost);

      const findOnePostsSpy = jest
        .spyOn(mockPostsRepository, 'findOne')
        .mockResolvedValue(expectedPost);

      const result = await service.createPost(
        user.userId,
        req.categoryId,
        req.title,
        req.thumbnailImageUrl,
        req.description,
      );

      expect(result.postId).toBe(expectedPost.postId);
      expect(result.userId).toBe(expectedPost.user.userId);
      expect(result.user.userId).toBe(expectedPost.user.userId);
      expect(result.user.email).toBe(expectedPost.user.email);
      expect(result.user.nickname).toBe(expectedPost.user.nickname);
      expect(result.user.createdAt).toEqual(expectedPost.createdAt);
      expect(result.user.updatedAt).toEqual(expectedPost.updatedAt);
      expect(result.categoryId).toBe(expectedPost.category.categoryId);
      expect(result.category.categoryId).toBe(expectedPost.category.categoryId);
      expect(result.category.title).toBe(expectedPost.category.title);
      expect(result.title).toBe(expectedPost.title);
      expect(result.thumbnailImageUrl).toBe(expectedPost.thumbnailImageUrl);
      expect(result.description).toBe(expectedPost.description);
      expect(result.createdAt).toEqual(expectedPost.createdAt);
      expect(result.updatedAt).toEqual(expectedPost.updatedAt);

      savePostsSpy.mockRestore();
      findOnePostsSpy.mockRestore();
    });

    it('internal server error', async () => {
      const req = {
        categoryId: post.category.categoryId,
        title: post.title,
        thumbnailImageUrl: post.thumbnailImageUrl,
        description: post.description,
      };

      const expectedError = new Error();

      const savePostsSpy = jest
        .spyOn(mockPostsRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.createPost(
          user.userId,
          req.categoryId,
          req.title,
          req.thumbnailImageUrl,
          req.description,
        );
      }).rejects.toThrowError(new InternalServerErrorException());

      savePostsSpy.mockRestore();
    });

    it('not found user', async () => {
      const req = {
        categoryId: post.category.categoryId,
        title: post.title,
        thumbnailImageUrl: post.thumbnailImageUrl,
        description: post.description,
      };

      const expectedError = {
        code: 'ER_NO_REFERENCED_ROW_2',
        sqlMessage:
          'Cannot add or update a child row: a foreign key constraint fails (`basic`.`posts`, CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`))',
      };

      const savePostsSpy = jest
        .spyOn(mockPostsRepository, 'save')
        .mockRejectedValue(expectedError);

      await expect(async () => {
        await service.createPost(
          0,
          req.categoryId,
          req.title,
          req.thumbnailImageUrl,
          req.description,
        );
      }).rejects.toThrowError(new NotFoundException(expectedError.sqlMessage));

      savePostsSpy.mockRestore();
    });
  });

  it('not found category', async () => {
    const req = {
      categoryId: createRandomInt(7, 10),
      title: post.title,
      thumbnailImageUrl: post.thumbnailImageUrl,
      description: post.description,
    };

    const expectedError = {
      code: 'ER_NO_REFERENCED_ROW_2',
      sqlMessage:
        'Cannot add or update a child row: a foreign key constraint fails (`basic`.`posts`, CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`))',
    };

    const savePostsSpy = jest
      .spyOn(mockPostsRepository, 'save')
      .mockRejectedValue(expectedError);

    await expect(async () => {
      await service.createPost(
        user.userId,
        req.categoryId,
        req.title,
        req.thumbnailImageUrl,
        req.description,
      );
    }).rejects.toThrowError(new NotFoundException(expectedError.sqlMessage));

    savePostsSpy.mockRestore();
  });
});
