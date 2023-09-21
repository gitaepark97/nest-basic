import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import {
  createRandomEmail,
  createRandomInt,
  createRandomString,
} from './utils/random';

const userAgent = 'test agent';
const clientIp = ':::1';

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

  afterEach((done) => {
    app.close();
    done();
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

    it('email is not empty', async () => {
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

    it('password is not empty', async () => {
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

    it('nickname is not empty', async () => {
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

  describe('login (POST)', () => {
    const email = createRandomEmail();
    const password = createRandomString(10);
    const nickname = createRandomString(15);

    it('before', async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email,
        password,
        nickname,
      });
    });

    it('success', async () => {
      const req = {
        email,
        password,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(201);
      expect(typeof body.sessionId).toBe('string');
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
      expect(body.user.email).toBe(req.email);
      expect(body.user.nickname).toBe(nickname);
      expect(typeof body.user.userId).toBe('number');
      expect(body.user.createdAt).toBeDefined();
      expect(body.user.updatedAt).toBeDefined();
    });

    it('required email', async () => {
      const req = {
        password,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'email should not be empty',
        'email must be an email',
      ]);
    });

    it('email is not empty', async () => {
      const req = {
        password,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'email should not be empty',
        'email must be an email',
      ]);
    });

    it('invalid email type', async () => {
      const req = {
        email: createRandomString(5),
        password,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['email must be an email']);
    });

    it('required password', async () => {
      const req = {
        email,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('password is not empty', async () => {
      const req = {
        email,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('invalid password type', async () => {
      const req = {
        email,
        password: createRandomInt(1, 10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['password must be a string']);
    });

    it('not found user', async () => {
      const req = {
        email: createRandomEmail(),
        password,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(404);
      expect(body.message).toBe('not found user');
    });

    it('wrong password', async () => {
      const req = {
        email,
        password: createRandomString(10),
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(req)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('wrong password');
    });
  });

  describe('renew refresh token (POST)', () => {
    let refreshToken;

    it('before', async () => {
      const email = createRandomEmail();
      const password = createRandomString(10);
      const nickname = createRandomString(15);

      await request(app.getHttpServer()).post('/api/auth/register').send({
        email,
        password,
        nickname,
      });

      const { body } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password,
        })
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp);

      refreshToken = body.refreshToken;
    });

    it('success', async () => {
      const req = {
        refreshToken,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(201);
      expect(typeof body.accessToken).toBe('string');
    });

    it('required refresh token', async () => {
      const req = {};

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'refreshToken should not be empty',
        'refreshToken must be a string',
      ]);
    });

    it('refresh token is not empty', async () => {
      const req = {};

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'refreshToken should not be empty',
        'refreshToken must be a string',
      ]);
    });
    it('required refresh token', async () => {
      const req = {};

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual([
        'refreshToken should not be empty',
        'refreshToken must be a string',
      ]);
    });

    it('invalid refresh token type', async () => {
      const req = {
        refreshToken: 1,
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toEqual(['refreshToken must be a string']);
    });

    it('invalid refresh token', async () => {
      const req = {
        refreshToken: 'invalid refresh token',
      };

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/api/auth/renew-access-token')
        .send(req);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('invalid refresh token');
    });
  });
});
