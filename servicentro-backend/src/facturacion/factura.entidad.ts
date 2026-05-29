import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venta } from '../ventas/venta.entidad';
import { Cliente } from '../clientes/cliente.entidad';

@Entity({ name: 'facturas' })
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @OneToOne(() => Venta, { eager: true })
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  razonSocial: string;

  @Column()
  nit: string;

  @Column()
  direccion: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @Column({ type: 'jsonb', nullable: true })
  datosNegocio?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  datosVehiculo?: Record<string, unknown>;

  @CreateDateColumn()
  emitidaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}
