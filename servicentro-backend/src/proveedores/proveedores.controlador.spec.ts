import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresControlador } from './proveedores.controlador';
import { ProveedoresServicio } from './proveedores.servicio';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';

describe('ProveedoresControlador', () => {
  let controlador: ProveedoresControlador;
  const servicioMock = {
    crear: jest.fn(),
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedoresControlador],
      providers: [{ provide: ProveedoresServicio, useValue: servicioMock }],
    }).compile();

    controlador = module.get<ProveedoresControlador>(ProveedoresControlador);
  });

  it('deberia estar definido', () => {
    expect(controlador).toBeDefined();
  });

  describe('crear', () => {
    it('deberia llamar a servicio.crear con el DTO correcto', () => {
      const dto: CrearProveedorDto = { nombre: 'Test' };
      controlador.crear(dto);
      expect(servicioMock.crear).toHaveBeenCalledWith(dto);
    });
  });

  describe('listar', () => {
    it('deberia llamar a servicio.listar', () => {
      controlador.listar();
      expect(servicioMock.listar).toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('deberia llamar a servicio.buscarPorId con el ID correcto', () => {
      const id = 'some-id';
      controlador.buscarPorId(id);
      expect(servicioMock.buscarPorId).toHaveBeenCalledWith(id);
    });
  });

  describe('actualizar', () => {
    it('deberia llamar a servicio.actualizar con el ID y DTO correctos', () => {
      const id = 'some-id';
      const dto: ActualizarProveedorDto = { nombre: 'Test Updated' };
      controlador.actualizar(id, dto);
      expect(servicioMock.actualizar).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('eliminar', () => {
    it('deberia llamar a servicio.eliminar con el ID correcto', () => {
      const id = 'some-id';
      controlador.eliminar(id);
      expect(servicioMock.eliminar).toHaveBeenCalledWith(id);
    });
  });
});
