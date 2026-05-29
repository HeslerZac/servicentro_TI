import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Existencia } from '../inventarios/existencia.entidad';
import { MovimientoInventario } from '../inventarios/movimiento-inventario.entidad';

@Entity({ name: 'bodegas' })
export class Bodega {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  codigo: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  ubicacion?: string;

  @CreateDateColumn({ type: 'timestamp' })
  creadaEn: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  actualizadaEn: Date;

  @OneToMany(() => Existencia, (existencia) => existencia.bodega)
  existencias: Existencia[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.bodega)
  movimientos: MovimientoInventario[];

  @DeleteDateColumn({ name: 'desactivado_en' })
  desactivadoEn?: Date;
}
