import { Test, TestingModule } from '@nestjs/testing';
import { AplicacionControlador } from './aplicacion.controlador';
import { AplicacionServicio } from './aplicacion.servicio';

describe('AplicacionControlador', () => {
  let aplicacionControlador: AplicacionControlador;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AplicacionControlador],
      providers: [AplicacionServicio],
    }).compile();

    aplicacionControlador = app.get<AplicacionControlador>(
      AplicacionControlador,
    );
  });

  describe('root', () => {
    it('should return "Hola Mundo!"', () => {
      expect(aplicacionControlador.obtenerSaludo()).toBe('Hola Mundo!');
    });
  });
});
