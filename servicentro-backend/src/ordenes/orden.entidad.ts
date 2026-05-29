import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entidad';
import { Vehiculo } from '../vehiculos/vehiculo.entidad';
import { Usuario } from '../usuarios/usuario.entidad';
import { OrdenDetalleProducto } from './detalles/orden-detalle-producto.entidad';
import { OrdenDetalleServicio } from './detalles/orden-detalle-servicio.entidad';
import { Venta } from '../ventas/venta.entidad';

export enum EstadoOrden {
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

@Entity({ name: 'ordenes_servicio' })
export class OrdenServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @ManyToOne(() => Cliente, { eager: true })
  cliente: Cliente;

  @ManyToOne(() => Vehiculo, { eager: true, nullable: true })
  vehiculo?: Vehiculo;

  @ManyToOne(() => Usuario, { eager: true })
  usuarioResponsable: Usuario;

  @Column({ type: 'enum', enum: EstadoOrden, default: EstadoOrden.EN_CURSO })
  estado: EstadoOrden;

  @Column({ nullable: true })
  observaciones?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalProductos: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalServicios: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;

  @OneToMany(() => OrdenDetalleProducto, (detalle) => detalle.orden, {
    cascade: true,
  })
  detallesProducto: OrdenDetalleProducto[];

  @OneToMany(() => OrdenDetalleServicio, (detalle) => detalle.orden, {
    cascade: true,
  })
  detallesServicio: OrdenDetalleServicio[];

  @OneToOne(() => Venta, (venta) => venta.orden, { nullable: true })
  @JoinColumn({ name: 'ventaId' })
  venta?: Venta;
}
