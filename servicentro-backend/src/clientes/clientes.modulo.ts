import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesServicio } from './clientes.servicio';
import { ClientesControlador } from './clientes.controlador';
import { Cliente } from './cliente.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesControlador],
  providers: [ClientesServicio],
  exports: [ClientesServicio],
})
export class ClientesModulo {}
