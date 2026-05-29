import { Test } from '@nestjs/testing';
import { VehiculosServicio } from './vehiculos.servicio';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehiculo } from './vehiculo.entidad';
import { Cliente } from '../clientes/cliente.entidad';
import { BadRequestException } from '@nestjs/common';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('VehiculosServicio', () => {
  let servicio: VehiculosServicio;
  let vehiculosRepo: ReturnType<typeof createMockRepo>;
  let clientesRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    vehiculosRepo = createMockRepo();
    clientesRepo = createMockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VehiculosServicio,
        { provide: getRepositoryToken(Vehiculo), useValue: vehiculosRepo },
        { provide: getRepositoryToken(Cliente), useValue: clientesRepo },
      ],
    }).compile();

    servicio = moduleRef.get(VehiculosServicio);
  });

  describe('crear', () => {
    const dtoBase = {
      clienteId: 'cli-1',
      placa: 'abc123',
      marca: 'Toyota',
      linea: 'Corolla',
    } as any;

    it('lanza error si el cliente no existe', async () => {
      clientesRepo.findOne.mockResolvedValue(null);

      await expect(servicio.crear(dtoBase)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(vehiculosRepo.save).not.toHaveBeenCalled();
    });

    it('lanza error si la placa ya existe', async () => {
      clientesRepo.findOne.mockResolvedValue({ id: 'cli-1' });
      vehiculosRepo.findOne.mockResolvedValue({ id: 'veh-1' });

      await expect(servicio.crear(dtoBase)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(vehiculosRepo.save).not.toHaveBeenCalled();
    });

    it('crea vehiculo convirtiendo la placa a mayusculas', async () => {
      clientesRepo.findOne.mockResolvedValue({ id: 'cli-1' });
      vehiculosRepo.findOne.mockResolvedValueOnce(null);
      const vehiculoCreado = { id: 'veh-2' } as Vehiculo;
      vehiculosRepo.create.mockReturnValue(vehiculoCreado);
      vehiculosRepo.save.mockResolvedValue(vehiculoCreado);

      const resultado = await servicio.crear({ ...dtoBase, placa: ' abC123 ' });

      expect(vehiculosRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          placa: 'ABC123',
        }),
      );
      expect(resultado).toBe(vehiculoCreado);
    });
  });

  describe('listar', () => {
    it('filtra por cliente cuando se indica', async () => {
      vehiculosRepo.find.mockResolvedValue([]);

      await servicio.listar('cli-2');

      expect(vehiculosRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ cliente: { id: 'cli-2' } }),
          order: { creadoEn: 'DESC' },
          relations: ['cliente'],
        }),
      );
    });
  });
});
