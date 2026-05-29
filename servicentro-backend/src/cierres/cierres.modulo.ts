import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierreVenta } from './cierre-venta.entidad';
import { CierresControlador } from './cierres.controlador';
import { CierresServicio } from './cierres.servicio';
import { Venta } from '../ventas/venta.entidad';
import { DetalleVenta } from '../ventas/detalle-venta.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([CierreVenta, Venta, DetalleVenta])],
  controllers: [CierresControlador],
  providers: [CierresServicio],
  exports: [TypeOrmModule, CierresServicio],
})
export class CierresModulo {}
