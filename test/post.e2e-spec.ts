import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import {
  createRandomEmail,
  createRandomInt,
  createRandomString,
} from './utils/random';

const userAgent = 'test agent';
const clientIp = ':::1';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterEach((done) => {
    app.close();
    done();
  });

  describe('create post (POST)', () => {
    let user;
    let accessToken;
    const nickname = createRandomString(15);

    it('before', async () => {
      const email = createRandomEmail();
      const password = createRandomString(10);

      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: email,
        password,
        nickname: nickname,
      });

      const { body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: email,
          password,
        })
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      user = body.user;
      accessToken = body.accessToken;
    });

    it('success', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(201);
      expect(typeof body.postId).toBe('number');
      expect(body.user.userId).toBe(user.userId);
      expect(body.user.email).toBe(user.email);
      expect(body.user.nickname).toBe(user.nickname);
      expect(body.user.createdAt).toEqual(user.createdAt);
      expect(body.user.updatedAt).toEqual(user.updatedAt);
      expect(body.categoryId).toBe(req.categoryId);
      expect(body.category.categoryId).toBe(req.categoryId);
      expect(typeof body.category.title).toBe('string');
      expect(body.title).toBe(req.title);
      expect(body.thumbnailImageUrl).toBe(req.thumbnailImageUrl);
      expect(body.description).toBe(req.description);
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('Uuauthorized', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req);

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Unauthorized');
    });

    it('required category id', async () => {
      const req = {
        title: createRandomString(50),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'categoryId should not be empty',
        'categoryId must be a number conforming to the specified constraints',
      ]);
    });

    it('invalid category id type', async () => {
      const req = {
        categoryId: createRandomString(5),
        title: createRandomString(50),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'categoryId must be a number conforming to the specified constraints',
      ]);
    });

    it('required title', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'title must be shorter than or equal to 255 characters',
        'title should not be empty',
        'title must be a string',
      ]);
    });

    it('title is not empty', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'title must be shorter than or equal to 255 characters',
        'title should not be empty',
        'title must be a string',
      ]);
    });

    it('invalid title type', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomInt(1, 10),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'title must be shorter than or equal to 255 characters',
        'title must be a string',
      ]);
    });

    it('invalid title length', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(256),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'title must be shorter than or equal to 255 characters',
      ]);
    });

    it('required thumnail image url', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'thumbnailImageUrl must be shorter than or equal to 255 characters',
        'thumbnailImageUrl should not be empty',
        'thumbnailImageUrl must be a string',
      ]);
    });

    it('thumnail image url is not empty', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: '',
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['thumbnailImageUrl should not be empty']);
    });

    it('invalid title type', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomInt(1, 10),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'thumbnailImageUrl must be shorter than or equal to 255 characters',
        'thumbnailImageUrl must be a string',
      ]);
    });

    it('invalid title length', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(256),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'thumbnailImageUrl must be shorter than or equal to 255 characters',
      ]);
    });

    it('required description', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'description should not be empty',
        'description must be a string',
      ]);
    });

    it('description is not empty', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
        description: '',
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['description should not be empty']);
    });

    it('invalid description type', async () => {
      const req = {
        categoryId: createRandomInt(1, 6),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomInt(1, 10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['description must be a string']);
    });

    it('not found category', async () => {
      const req = {
        categoryId: createRandomInt(7, 10),
        title: createRandomString(10),
        thumbnailImageUrl: createRandomString(50),
        description: createRandomString(100),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/posts')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(
        'Cannot add or update a child row: a foreign key constraint fails (`basic`.`posts`, CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`))',
      );
    });
  });
});
