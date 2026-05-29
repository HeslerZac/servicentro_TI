import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './vehiculo.entidad';
import { VehiculosServicio } from './vehiculos.servicio';
import { VehiculosControlador } from './vehiculos.controlador';
import { Cliente } from '../clientes/cliente.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Cliente])],
  controllers: [VehiculosControlador],
  providers: [VehiculosServicio],
  exports: [VehiculosServicio],
})
export class VehiculosModulo {}
