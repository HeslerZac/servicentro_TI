import { Test } from '@nestjs/testing';
import { ClientesControlador } from './clientes.controlador';
import { ClientesServicio } from './clientes.servicio';

const crearMockServicio = () => ({
  crear: jest.fn(),
  listar: jest.fn(),
  buscarPorId: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
});

describe('ClientesControlador', () => {
  let controlador: ClientesControlador;
  let servicio: ReturnType<typeof crearMockServicio>;

  beforeEach(async () => {
    servicio = crearMockServicio();

    const moduleRef = await Test.createTestingModule({
      controllers: [ClientesControlador],
      providers: [{ provide: ClientesServicio, useValue: servicio }],
    }).compile();

    controlador = moduleRef.get(ClientesControlador);
  });

  it('debe estar definido', () => {
    expect(controlador).toBeDefined();
  });

  it('delegar crear al servicio', async () => {
    servicio.crear.mockResolvedValue({ id: 'cli-1' });

    await controlador.crear({} as any);

    expect(servicio.crear).toHaveBeenCalled();
  });
});
