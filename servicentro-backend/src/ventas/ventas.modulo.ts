import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './venta.entidad';
import { DetalleVenta } from './detalle-venta.entidad';
import { VentasControlador } from './ventas.controlador';
import { VentasServicio } from './ventas.servicio';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta])],
  controllers: [VentasControlador],
  providers: [VentasServicio],
  exports: [VentasServicio],
})
export class VentasModulo {}
