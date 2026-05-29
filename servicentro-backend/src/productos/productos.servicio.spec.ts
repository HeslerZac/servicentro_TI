import { Test } from '@nestjs/testing';
import { ProductosServicio } from './productos.servicio';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from './producto.entidad';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventariosServicio } from '../inventarios/inventarios.servicio';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
});

describe('ProductosServicio', () => {
  let servicio: ProductosServicio;
  let repo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    repo = createMockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductosServicio,
        { provide: getRepositoryToken(Producto), useValue: repo },
        {
          provide: InventariosServicio,
          useValue: {
            obtenerTotalesProducto: jest
              .fn()
              .mockResolvedValue({ cantidadTotal: 0, reservadoTotal: 0 }),
          },
        },
      ],
    }).compile();

    servicio = moduleRef.get(ProductosServicio);
  });

  describe('crear', () => {
    it('evita codigos duplicados', async () => {
      repo.findOne.mockResolvedValue({ id: 'prod-1' });

      await expect(
        servicio.crear({ codigo: 'AZ-1', descripcion: 'Test' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('transforma precios a string', async () => {
      repo.findOne.mockResolvedValue(null);
      const entity = { id: 'prod-2' } as Producto;
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      await servicio.crear({
        codigo: 'AZ-2',
        descripcion: 'Test',
        precioA: 10,
      } as any);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          precioA: '10',
          precioB: '0',
          precioMayorista: '0',
        }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('lanza not found cuando no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(servicio.buscarPorId('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('listar', () => {
    it('usa el query builder para la búsqueda', async () => {
      await servicio.listar({});
      expect(repo.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
