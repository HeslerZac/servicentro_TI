import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cajas_sesion')
export class CajaSesion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'ABIERTA' })
  estado: 'ABIERTA' | 'CERRADA';

  @Column({ name: 'fechaapertura', type: 'timestamp', default: () => 'now()' })
  fechaApertura: Date;

  @Column({ name: 'fechacierre', type: 'timestamp', nullable: true })
  fechaCierre?: Date | null;

  @Column({
    name: 'saldoinicialefectivo',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  saldoInicialEfectivo: string;

  @Column({
    name: 'saldoteoricoefectivo',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  saldoTeoricoEfectivo: string;

  @Column({
    name: 'saldorealefectivo',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  saldoRealEfectivo?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  diferencia?: string | null;

  @Column({
    name: 'totalefectivo',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalEfectivo: string;

  @Column({
    name: 'totaltarjeta',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalTarjeta: string;

  @Column({
    name: 'totaltransfer',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalTransfer: string;

  @CreateDateColumn({ name: 'creadoen' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizadoen' })
  actualizadoEn: Date;
}
