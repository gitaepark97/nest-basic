import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { createRandomEmail, createRandomString } from './utils/random';

const userAgent = 'test agent';
const clientIp = ':::1';

describe('CategoriesController (e2e)', () => {
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

  describe('get category list (GET)', () => {
    let accessToken;
    const nickname1 = createRandomString(15);
    const nickname2 = createRandomString(15);

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

      accessToken = body.accessToken;
    });

    it('success', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);

      body.list.forEach((category) => {
        expect(typeof category.categoryId).toBe('number');
        expect(typeof category.title).toBe('string');
      });
    });
  });
});
