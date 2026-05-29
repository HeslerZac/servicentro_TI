import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenServicio } from './orden.entidad';
import { OrdenDetalleProducto } from './detalles/orden-detalle-producto.entidad';
import { OrdenDetalleServicio } from './detalles/orden-detalle-servicio.entidad';
import { OrdenesServicio } from './ordenes.servicio';
import { InventariosModulo } from '../inventarios/inventarios.modulo';
import { VentasModulo } from '../ventas/ventas.modulo';
import { CajaModulo } from '../caja/caja.modulo';
import { OrdenesControlador } from './ordenes.controlador';
import { Cliente } from '../clientes/cliente.entidad';
import { Vehiculo } from '../vehiculos/vehiculo.entidad';
import { Usuario } from '../usuarios/usuario.entidad';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenServicio,
      OrdenDetalleProducto,
      OrdenDetalleServicio,
      Cliente,
      Vehiculo,
      Usuario,
      Producto,
      Bodega,
    ]),
    InventariosModulo,
    VentasModulo,
    CajaModulo,
  ],
  controllers: [OrdenesControlador],
  providers: [OrdenesServicio],
  exports: [TypeOrmModule, OrdenesServicio],
})
export class OrdenesModulo {}
