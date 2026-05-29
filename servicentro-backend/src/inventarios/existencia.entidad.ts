import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

const decimalTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('existencias')
@Unique(['producto', 'bodega'])
export class Existencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Index()
  @ManyToOne(() => Bodega, { eager: true })
  @JoinColumn({ name: 'bodegaId' })
  bodega: Bodega;

  @Column('numeric', {
    precision: 12,
    scale: 3,
    default: 0,
    transformer: decimalTransformer,
  })
  cantidad: number;

  @Column('numeric', {
    precision: 12,
    scale: 3,
    default: 0,
    transformer: decimalTransformer,
  })
  cantidadReservada: number;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
