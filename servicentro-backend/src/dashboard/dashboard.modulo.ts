import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardControlador } from './dashboard.controlador';
import { DashboardServicio } from './dashboard.servicio';
import { Venta } from '../ventas/venta.entidad';
import { DetalleVenta } from '../ventas/detalle-venta.entidad';
import { OrdenServicio } from '../ordenes/orden.entidad';
import { Existencia } from '../inventarios/existencia.entidad';
import { Producto } from '../productos/producto.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      OrdenServicio,
      Existencia,
      Producto,
    ]),
  ],
  controllers: [DashboardControlador],
  providers: [DashboardServicio],
})
export class DashboardModulo {}
