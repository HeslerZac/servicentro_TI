import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosServicio } from './productos.servicio';
import { ProductosControlador } from './productos.controlador';
import { Producto } from './producto.entidad';
import { InventariosModulo } from '../inventarios/inventarios.modulo';

@Module({
  imports: [TypeOrmModule.forFeature([Producto]), InventariosModulo],
  controllers: [ProductosControlador],
  providers: [ProductosServicio],
  // Exporta TypeOrmModule para que otros módulos puedan inyectar ProductoRepository
  exports: [ProductosServicio, TypeOrmModule],
})
export class ProductosModulo {}
