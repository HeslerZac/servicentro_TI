import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate } from '@nestjs/common';
import request from 'supertest';
import { DashboardControlador } from '../src/dashboard/dashboard.controlador';
import { DashboardServicio } from '../src/dashboard/dashboard.servicio';
import { RolesGuard } from '../src/seguridad/guards/roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtEstrategia } from '../src/seguridad/estrategias/jwt.estrategia';
import { ConfigService } from '@nestjs/config';

class AllowGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

describe('Dashboard (e2e, mocks)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: 3600 },
        }),
        PassportModule,
      ],
      controllers: [DashboardControlador],
      providers: [
        {
          provide: DashboardServicio,
          useValue: {
            kpis: jest.fn().mockResolvedValue({
              ventasDelDia: 1500,
              ordenesEnCurso: 3,
              productosConStockBajo: 2,
              umbral: 5,
            }),
            ventasUltimos30Dias: jest.fn().mockResolvedValue([
              { fecha: '2025-10-01', total: 100 },
              { fecha: '2025-10-02', total: 0 },
            ]),
            productosMasVendidos: jest.fn().mockResolvedValue([
              {
                productoId: 'p1',
                descripcion: 'Aceite 20w50',
                cantidad: 12,
                total: 600,
              },
              {
                productoId: 'p2',
                descripcion: 'Filtro',
                cantidad: 8,
                total: 280,
              },
            ]),
          } as any,
        },
        JwtEstrategia,
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: RolesGuard, useClass: AllowGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const jwt = moduleFixture.get(JwtService);
    token = await jwt.signAsync({
      sub: 'u-1',
      nombreUsuario: 'admin',
      rol: 'ADMINISTRADOR',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/dashboard/kpis (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/kpis?stockMinimo=7')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('ventasDelDia');
    expect(res.body).toHaveProperty('ordenesEnCurso');
    expect(res.body).toHaveProperty('productosConStockBajo');
  });

  it('/dashboard/ventas-ultimos-30-dias (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/ventas-ultimos-30-dias')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/dashboard/productos-mas-vendidos (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/productos-mas-vendidos?limite=5&dias=7')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
