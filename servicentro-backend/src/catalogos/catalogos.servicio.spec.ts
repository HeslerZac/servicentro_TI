import { Test } from '@nestjs/testing';
import { CatalogosServicio } from './catalogos.servicio';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Categoria } from './categoria.entidad';
import { Marca } from './marca.entidad';
import { CategoriaMarca } from './categoria-marca.entidad';
import { BadRequestException } from '@nestjs/common';

type MockRepo = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

const createMockRepo = (): MockRepo => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('CatalogosServicio', () => {
  let servicio: CatalogosServicio;
  let categoriasRepo: MockRepo<Categoria>;
  let marcasRepo: MockRepo<Marca>;
  let categoriasMarcasRepo: MockRepo<CategoriaMarca>;

  beforeEach(async () => {
    categoriasRepo = createMockRepo();
    marcasRepo = createMockRepo();
    categoriasMarcasRepo = createMockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogosServicio,
        { provide: getRepositoryToken(Categoria), useValue: categoriasRepo },
        { provide: getRepositoryToken(Marca), useValue: marcasRepo },
        {
          provide: getRepositoryToken(CategoriaMarca),
          useValue: categoriasMarcasRepo,
        },
      ],
    }).compile();

    servicio = moduleRef.get(CatalogosServicio);
  });

  describe('crearCategoria', () => {
    it('rechaza nombres duplicados', async () => {
      categoriasRepo.findOne.mockResolvedValue({ id: 'cat-1' });

      await expect(
        servicio.crearCategoria({ nombre: 'Lubricantes' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(categoriasRepo.save).not.toHaveBeenCalled();
    });

    it('crea categoria con nombre recortado y activa por defecto', async () => {
      categoriasRepo.findOne.mockResolvedValue(null);
      const creada = {
        id: 'cat-2',
        nombre: 'Aceites',
        estaActiva: true,
      } as Categoria;
      categoriasRepo.create.mockReturnValue(creada);
      categoriasRepo.save.mockResolvedValue(creada);

      const resultado = await servicio.crearCategoria({
        nombre: '  Aceites  ',
        descripcion: 'Linea',
      });

      expect(categoriasRepo.create).toHaveBeenCalledWith({
        nombre: 'Aceites',
        descripcion: 'Linea',
        estaActiva: true,
      });
      expect(resultado).toBe(creada);
    });
  });

  describe('listarMarcas', () => {
    it('filtra marcas activas por defecto', async () => {
      marcasRepo.find.mockResolvedValue([]);

      await servicio.listarMarcas();

      expect(marcasRepo.find).toHaveBeenCalledWith({
        where: { estaActiva: true },
        order: { nombre: 'ASC' },
      });
    });
  });

  describe('asignarMarcaACategoria', () => {
    const categoria = { id: 'cat-1' } as Categoria;
    const marca = { id: 'mar-1' } as Marca;

    beforeEach(() => {
      categoriasRepo.findOne.mockResolvedValue(categoria);
      marcasRepo.findOne.mockResolvedValue(marca);
    });

    it('evita asignar una marca repetida', async () => {
      categoriasMarcasRepo.findOne.mockResolvedValue({ id: 'rel-1' });

      await expect(
        servicio.asignarMarcaACategoria('cat-1', 'mar-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(categoriasMarcasRepo.save).not.toHaveBeenCalled();
    });

    it('crea la relacion cuando no existe', async () => {
      categoriasMarcasRepo.findOne.mockResolvedValue(null);
      categoriasMarcasRepo.create.mockReturnValue({ id: 'rel-2' });
      categoriasMarcasRepo.save.mockResolvedValue({ id: 'rel-2' });

      await servicio.asignarMarcaACategoria('cat-1', 'mar-1');

      expect(categoriasMarcasRepo.create).toHaveBeenCalledWith({
        categoria,
        marca,
      });
      expect(categoriasMarcasRepo.save).toHaveBeenCalled();
    });
  });
});
