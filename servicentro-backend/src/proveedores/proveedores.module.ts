import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './proveedor.entidad';
import { ProveedoresServicio } from './proveedores.servicio';
import { ProveedoresControlador } from './proveedores.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresControlador],
  providers: [ProveedoresServicio],
})
export class ProveedoresModule {}
