import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AutenticacionControlador } from '../src/seguridad/autenticacion.controlador';
import { AutenticacionServicio } from '../src/seguridad/autenticacion.servicio';
import { UsuariosServicio } from '../src/usuarios/usuarios.servicio';
import { RolUsuario } from '../src/usuarios/usuario.entidad';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const mockUsuariosServicio = {
    validarCredenciales: jest.fn().mockResolvedValue({
      id: 'u-1',
      nombreUsuario: 'admin',
      rol: RolUsuario.ADMINISTRADOR,
      estaActivo: true,
    }),
  } as Partial<UsuariosServicio> as UsuariosServicio;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: 3600 },
        }),
      ],
      controllers: [AutenticacionControlador],
      providers: [
        AutenticacionServicio,
        { provide: UsuariosServicio, useValue: mockUsuariosServicio },
        { provide: ConfigService, useValue: { get: () => '3600' } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'admin', contrasena: 'admin123' })
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.nombreUsuario).toBe('admin');
  });
});
