import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

const decimalTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('movimientos_inventario')
export class MovimientoInventario {
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

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo: TipoMovimiento;

  // Guardamos la cantidad como positiva; el signo lo interpreta el tipo de movimiento
  @Column('numeric', {
    precision: 12,
    scale: 3,
    transformer: decimalTransformer,
  })
  cantidad: number;

  @Column({ nullable: true })
  motivo?: string;

  @CreateDateColumn()
  creadoEn: Date;
}
