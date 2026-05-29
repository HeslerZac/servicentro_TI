import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodegasServicio } from './bodegas.servicio';
import { BodegasControlador } from './bodegas.controlador';
import { Bodega } from './bodega.entidad';
import { InventariosModulo } from '../inventarios/inventarios.modulo';

@Module({
  imports: [TypeOrmModule.forFeature([Bodega]), InventariosModulo],
  controllers: [BodegasControlador],
  providers: [BodegasServicio],
  exports: [BodegasServicio],
})
export class BodegasModulo {}
