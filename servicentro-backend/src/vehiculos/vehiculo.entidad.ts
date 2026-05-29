import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entidad';

@Entity({ name: 'vehiculos' })
@Unique(['placa'])
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.vehiculos, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @Column()
  placa: string;

  @Column()
  marca: string;

  @Column()
  linea: string;

  @Column({ nullable: true })
  modelo?: string;

  @Column({ nullable: true })
  color?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
