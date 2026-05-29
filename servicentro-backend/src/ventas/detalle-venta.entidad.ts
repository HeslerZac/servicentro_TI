import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Venta } from './venta.entidad';
import { Producto } from '../productos/producto.entidad';

@Entity('detalles_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venta, (venta) => venta.detalles, { onDelete: 'CASCADE' })
  venta: Venta;

  @ManyToOne(() => Producto, { eager: true, nullable: true })
  producto?: Producto;

  @Column({ nullable: true })
  descripcion?: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  cantidad: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  costoUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precioUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;
}
