import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Proveedor } from '../proveedores/proveedor.entidad';
import { CompraDetalle } from './compra-detalle.entidad';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Proveedor, { eager: true })
  proveedor: Proveedor;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra, {
    cascade: true,
  })
  detalles: CompraDetalle[];

  @CreateDateColumn()
  creadoEn: Date;
}
