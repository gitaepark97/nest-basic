import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';

describe('AppController (e2e)', () => {
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

  describe('health-check (GET)', () => {
    it('success', () => {
      return request(app.getHttpServer()).get('/api/health-check').expect(200);
    });
  });
});
