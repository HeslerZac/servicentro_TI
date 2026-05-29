import { Controller, Get } from '@nestjs/common';
import { AplicacionServicio } from './aplicacion.servicio';

@Controller()
export class AplicacionControlador {
  constructor(private readonly aplicacionServicio: AplicacionServicio) {}

  @Get()
  obtenerSaludo(): string {
    return this.aplicacionServicio.obtenerSaludo();
  }
}
