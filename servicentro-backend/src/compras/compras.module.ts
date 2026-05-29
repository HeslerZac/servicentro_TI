import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './compra.entidad';
import { CompraDetalle } from './compra-detalle.entidad';
import { ComprasServicio } from './compras.servicio';
import { ComprasControlador } from './compras.controlador';
import { InventariosModule } from '../inventarios/inventarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra, CompraDetalle]),
    InventariosModule,
  ],
  controllers: [ComprasControlador],
  providers: [ComprasServicio],
})
export class ComprasModule {}
