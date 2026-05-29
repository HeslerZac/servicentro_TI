import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculo.entidad';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Index()
  @Column({ default: 'CF' })
  nit: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Index({ unique: true, where: '"correo" IS NOT NULL' })
  @Column({ nullable: true })
  correo?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.cliente)
  vehiculos: Vehiculo[];

  @DeleteDateColumn({ name: 'desactivado_en' })
  desactivadoEn?: Date;
}
