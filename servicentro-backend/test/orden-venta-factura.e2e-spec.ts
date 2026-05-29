import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate } from '@nestjs/common';
import request from 'supertest';
import { OrdenesControlador } from '../src/ordenes/ordenes.controlador';
import { FacturacionControlador } from '../src/facturacion/facturacion.controlador';
import { OrdenesServicio } from '../src/ordenes/ordenes.servicio';
import { FacturacionServicio } from '../src/facturacion/facturacion.servicio';
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

describe('Flujo Orden ? Venta ? Factura (e2e, mocks)', () => {
  let app: INestApplication;
  let token: string;

  const ordenMock = {
    id: 'ord-1',
    numero: 'OS-0001',
    total: '100.00',
    estado: 'EN_CURSO',
  } as any;

  const ventaMock = { id: 'ven-1', total: '100.00' } as any;
  const facturaMock = { id: 'fac-1', numero: 'F-1', total: '100.00' } as any;

  const mockOrdenesServicio: Partial<OrdenesServicio> = {
    crear: jest.fn().mockResolvedValue(ordenMock),
    finalizar: jest.fn().mockResolvedValue({
      ...ordenMock,
      estado: 'FINALIZADA',
      venta: ventaMock,
    }),
  };

  const mockFacturacionServicio: Partial<FacturacionServicio> = {
    listar: jest.fn().mockResolvedValue([facturaMock]),
    emitir: jest.fn().mockResolvedValue(facturaMock),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: 3600 },
        }),
        PassportModule,
      ],
      controllers: [OrdenesControlador, FacturacionControlador],
      providers: [
        { provide: OrdenesServicio, useValue: mockOrdenesServicio },
        { provide: FacturacionServicio, useValue: mockFacturacionServicio },
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

  it('crea una orden', async () => {
    const res = await request(app.getHttpServer())
      .post('/ordenes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        numero: 'OS-0001',
        clienteId: 'cli-1',
        usuarioId: 'usr-1',
        productos: [],
        servicios: [],
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'ord-1');
  });

  it('finaliza la orden y genera la venta', async () => {
    const res = await request(app.getHttpServer())
      .post('/ordenes/ord-1/finalizar')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(res.body).toHaveProperty('estado', 'FINALIZADA');
  });

  it('emite una factura para la venta', async () => {
    const res = await request(app.getHttpServer())
      .post('/facturacion')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ventaId: 'ven-1',
        numero: 'F-1',
        razonSocial: 'Cliente X',
        nit: 'CF',
        direccion: 'Zona 1',
        fecha: new Date().toISOString(),
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'fac-1');
  });
});
