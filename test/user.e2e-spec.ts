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
import { sleep } from './utils/sleep';

const userAgent = 'test agent';
const clientIp = ':::1';

describe('UsersController (e2e)', () => {
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
    app.enableCors({
      origin: true,
      credentials: true,
    });
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  describe('update user (PATCH)', () => {
    let user;
    let accessToken;
    const nickname1 = createRandomString(15);
    const nickname2 = createRandomString(15);
    const updatedNickname = createRandomString(15);

    it('before', async () => {
      const email1 = createRandomEmail();
      const email2 = createRandomEmail();
      const password = createRandomString(10);

      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: email1,
        password,
        nickname: nickname1,
      });

      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: email2,
        password,
        nickname: nickname2,
      });

      const { body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: email1,
          password,
        })
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      user = body.user;
      accessToken = body.accessToken;
    });

    it('success', async () => {
      const req = {
        nickname: updatedNickname,
      };

      await sleep(1000);

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body.email).toBe(user.email);
      expect(body.nickname).toBe(req.nickname);
      expect(body.userId).toBe(user.userId);
      expect(body.createdAt).toBe(user.createdAt);
      expect(body.updatedAt).toBeDefined();
      expect(body.updatedAt).not.toEqual(user.updatedAt);
    });

    it('Uuauthorized', async () => {
      const req = {
        nickname: updatedNickname,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req);

      expect(statusCode).toBe(401);
      expect(body.message).toBe('Unauthorized');
    });

    it('nickname is not empty', async () => {
      const req = {
        nickname: '',
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['nickname should not be empty']);
    });

    it('invalid nickname type', async () => {
      const req = {
        nickname: createRandomInt(1, 10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'nickname must be shorter than or equal to 50 characters',
        'nickname must be a string',
      ]);
    });

    it('invalid nickname length', async () => {
      const req = {
        nickname: createRandomString(51),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'nickname must be shorter than or equal to 50 characters',
      ]);
    });

    it('duplicate nickname', async () => {
      const req = {
        nickname: nickname2,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .patch('/api/users')
        .send(req)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toBe(
        `Duplicate entry '${nickname2}' for key 'nickname'`,
      );
    });
  });
});
