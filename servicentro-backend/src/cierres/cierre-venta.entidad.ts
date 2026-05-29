import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cierres_ventas' })
export class CierreVenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  periodo: string;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalCosto: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalVenta: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalGanancia: string;

  @Column({ type: 'jsonb', nullable: true })
  detalle?: Record<string, unknown>;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
