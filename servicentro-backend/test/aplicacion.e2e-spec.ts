import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AplicacionModulo } from './../src/aplicacion.modulo';

describe('Aplicacion (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AplicacionModulo],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/salud (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/salud').expect(200);
    expect(res.body).toHaveProperty('estado', true);
  });
});
