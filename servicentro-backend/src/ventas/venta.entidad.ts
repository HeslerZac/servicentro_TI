import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entidad';
import { Usuario } from '../usuarios/usuario.entidad';
import { DetalleVenta } from './detalle-venta.entidad';
import { OrdenServicio } from '../ordenes/orden.entidad';
import { CajaSesion } from '../caja/caja.entidad';

export enum EstadoVenta {
  ABIERTA = 'ABIERTA',
  PAGADA = 'PAGADA',
  ANULADA = 'ANULADA',
}

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @Column({ type: 'enum', enum: EstadoVenta, default: EstadoVenta.ABIERTA })
  estado: EstadoVenta;

  @ManyToOne(() => Cliente, { nullable: true })
  cliente?: Cliente;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario: Usuario;

  @OneToOne(() => OrdenServicio, (orden) => orden.venta, { nullable: true })
  @JoinColumn({ name: 'ordenId' })
  orden?: OrdenServicio;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  descuento: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  impuestos: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  // Datos de pago (opcionales)
  @Column({ name: 'formapago', nullable: true })
  formaPago?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  recibido?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  cambio?: string | null;

  @ManyToOne(() => CajaSesion, { nullable: true })
  @JoinColumn({ name: 'cajasesionid' })
  cajaSesion?: CajaSesion | null;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;

  @DeleteDateColumn({ name: 'anulada_en' })
  anuladaEn?: Date;
}
