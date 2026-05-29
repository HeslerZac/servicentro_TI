import { Test } from '@nestjs/testing';
import { ClientesServicio } from './clientes.servicio';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './cliente.entidad';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ClientesServicio', () => {
  let servicio: ClientesServicio;
  let repo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    repo = createMockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientesServicio,
        { provide: getRepositoryToken(Cliente), useValue: repo },
      ],
    }).compile();

    servicio = moduleRef.get(ClientesServicio);
  });

  describe('crear', () => {
    it('lanza error si el correo ya existe', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 'cli-1' });

      await expect(
        servicio.crear({ nombre: 'Juan', correo: 'test@mail.com' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('crea cliente con nit por defecto', async () => {
      repo.findOne.mockResolvedValue(null);
      const entidad = { id: 'cli-2', nit: 'CF' } as Cliente;
      repo.create.mockReturnValue(entidad);
      repo.save.mockResolvedValue(entidad);

      const resultado = await servicio.crear({ nombre: 'Ana' } as any);

      expect(repo.create).toHaveBeenCalledWith({
        nit: 'CF',
        nombre: 'Ana',
      });
      expect(resultado).toBe(entidad);
    });
  });

  describe('listar', () => {
    it('consulta ordenando por fecha', async () => {
      repo.find.mockResolvedValue([]);

      await servicio.listar();

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { creadoEn: 'DESC' } }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('lanza not found si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(servicio.buscarPorId('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
