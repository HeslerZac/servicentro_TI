import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventariosServicio } from './inventarios.servicio';
import { InventariosControlador } from './inventarios.controlador';
import { Existencia } from './existencia.entidad';
import { MovimientoInventario } from './movimiento-inventario.entidad';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Existencia,
      MovimientoInventario,
      Producto,
      Bodega,
    ]),
  ],
  controllers: [InventariosControlador],
  providers: [InventariosServicio],
  exports: [InventariosServicio],
})
export class InventariosModulo {}
