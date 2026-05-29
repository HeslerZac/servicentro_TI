import { Test } from '@nestjs/testing';
import { ProductosControlador } from './productos.controlador';
import { ProductosServicio } from './productos.servicio';

const crearMockServicio = () => ({
  crear: jest.fn(),
  listar: jest.fn(),
  buscarPorId: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
});

describe('ProductosControlador', () => {
  let controlador: ProductosControlador;
  let servicio: ReturnType<typeof crearMockServicio>;

  beforeEach(async () => {
    servicio = crearMockServicio();

    const moduleRef = await Test.createTestingModule({
      controllers: [ProductosControlador],
      providers: [{ provide: ProductosServicio, useValue: servicio }],
    }).compile();

    controlador = moduleRef.get(ProductosControlador);
  });

  it('debe estar definido', () => {
    expect(controlador).toBeDefined();
  });

  it('delega crear en el servicio', async () => {
    servicio.crear.mockResolvedValue({ id: 'prod-1' });

    await controlador.crear({} as any);

    expect(servicio.crear).toHaveBeenCalled();
  });
});
