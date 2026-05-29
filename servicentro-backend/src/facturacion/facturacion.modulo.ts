import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './factura.entidad';
import { FacturacionControlador } from './facturacion.controlador';
import { FacturacionServicio } from './facturacion.servicio';
import { Venta } from '../ventas/venta.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Venta])],
  controllers: [FacturacionControlador],
  providers: [FacturacionServicio],
  exports: [TypeOrmModule, FacturacionServicio],
})
export class FacturacionModulo {}
