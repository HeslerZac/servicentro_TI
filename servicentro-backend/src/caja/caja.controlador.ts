import { Body, Controller, Get, Post } from '@nestjs/common';
import { CajaServicio } from './caja.servicio';
import { AperturaCajaDto } from './dto/apertura-caja.dto';
import { CierreCajaDto } from './dto/cierre-caja.dto';

@Controller('caja')
export class CajaControlador {
  constructor(private readonly servicio: CajaServicio) {}

  @Get('sesion-actual')
  async sesionActual() {
    const s = await this.servicio.sesionActual();
    return s ?? null;
  }

  @Post('apertura')
  abrir(@Body() dto: AperturaCajaDto) {
    return this.servicio.abrir(dto);
  }

  @Post('cierre')
  cerrar(@Body() dto: CierreCajaDto) {
    return this.servicio.cerrar(dto);
  }

  @Get('resumen')
  resumen() {
    return this.servicio.resumenActual();
  }
}
