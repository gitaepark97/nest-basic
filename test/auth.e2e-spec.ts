import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/filters/http-exception.filter';
import {
  createRandomEmail,
  createRandomInt,
  createRandomString,
} from './utils/random';

describe('AuthController (e2e)', () => {
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

  describe('register (POST)', () => {
    const email = createRandomEmail();
    const nickname = createRandomString(15);

    it('success', async () => {
      const req = {
        email,
        password: createRandomString(10),
        nickname,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(201);
      expect(body.email).toBe(req.email);
      expect(body.nickname).toBe(req.nickname);
      expect(typeof body.userId).toBe('number');
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('required email', async () => {
      const req = {
        password: createRandomString(10),
        nickname: createRandomString(15),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'email should not be empty',
        'email must be an email',
      ]);
    });

    it('invalid email type', async () => {
      const req = {
        email: createRandomString(5),
        password: createRandomString(10),
        nickname: createRandomString(15),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['email must be an email']);
    });

    it('required password', async () => {
      const req = {
        email: createRandomEmail(),
        nickname: createRandomString(15),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('invalid password type', async () => {
      const req = {
        email: createRandomEmail(),
        password: createRandomInt(1, 10),
        nickname: createRandomString(15),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['password must be a string']);
    });

    it('required nickname', async () => {
      const req = {
        email: createRandomEmail(),
        password: createRandomString(10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'nickname must be shorter than or equal to 50 characters',
        'nickname should not be empty',
        'nickname must be a string',
      ]);
    });

    it('invalid nickname type', async () => {
      const req = {
        email: createRandomEmail(),
        password: createRandomString(10),
        nickname: createRandomInt(1, 10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'nickname must be shorter than or equal to 50 characters',
        'nickname must be a string',
      ]);
    });

    it('invalid nickname length', async () => {
      const req = {
        email: createRandomEmail(),
        password: createRandomString(10),
        nickname: createRandomString(51),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'nickname must be shorter than or equal to 50 characters',
      ]);
    });

    it('duplicate email', async () => {
      const req = {
        email,
        password: createRandomString(10),
        nickname: createRandomString(15),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toBe(`Duplicate entry '${email}' for key 'email'`);
    });

    it('duplicate nickname', async () => {
      const req = {
        email: createRandomEmail(),
        password: createRandomString(10),
        nickname,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toBe(
        `Duplicate entry '${nickname}' for key 'nickname'`,
      );
    });
  });
});
