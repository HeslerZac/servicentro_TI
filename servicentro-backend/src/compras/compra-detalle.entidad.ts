import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Compra } from './compra.entidad';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

@Entity('compras_detalles')
export class CompraDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra, (compra) => compra.detalles, { onDelete: 'CASCADE' })
  compra: Compra;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ManyToOne(() => Bodega, { eager: true })
  bodega: Bodega;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  cantidad: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  costoUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;
}
