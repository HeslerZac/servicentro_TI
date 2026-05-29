import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Existencia } from './existencia.entidad';
import { MovimientoInventario } from './movimiento-inventario.entidad';
import { InventariosServicio } from './inventarios.servicio';
import { InventariosControlador } from './inventarios.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Existencia, MovimientoInventario])],
  controllers: [InventariosControlador],
  providers: [InventariosServicio],
  exports: [InventariosServicio],
})
export class InventariosModule {}
