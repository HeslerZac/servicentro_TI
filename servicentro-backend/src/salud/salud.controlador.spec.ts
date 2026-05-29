import { Test, TestingModule } from '@nestjs/testing';
import { SaludControlador } from './salud.controlador';

describe('SaludControlador', () => {
  let controlador: SaludControlador;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaludControlador],
    }).compile();

    controlador = module.get<SaludControlador>(SaludControlador);
  });

  it('debe estar definido', () => {
    expect(controlador).toBeDefined();
  });
});
