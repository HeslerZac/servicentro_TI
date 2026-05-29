import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaSesion } from './caja.entidad';
import { Venta } from '../ventas/venta.entidad';
import { CajaServicio } from './caja.servicio';
import { CajaControlador } from './caja.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([CajaSesion, Venta])],
  controllers: [CajaControlador],
  providers: [CajaServicio],
  exports: [CajaServicio],
})
export class CajaModulo {}
