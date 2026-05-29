import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdenServicio } from '../orden.entidad';
import { Producto } from '../../productos/producto.entidad';
import { Bodega } from '../../bodegas/bodega.entidad';

@Entity({ name: 'ordenes_detalles_producto' })
export class OrdenDetalleProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrdenServicio, (orden) => orden.detallesProducto, {
    onDelete: 'CASCADE',
  })
  orden: OrdenServicio;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ManyToOne(() => Bodega, { eager: true })
  bodega: Bodega;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  cantidad: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  costoUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precioUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
