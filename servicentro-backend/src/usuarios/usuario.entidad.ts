import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  SECRETARIA = 'SECRETARIA',
  VENDEDOR = 'VENDEDOR',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  nombreUsuario: string;

  // Datos del empleado
  @Column({ nullable: true })
  nombre?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column()
  contrasenaHash: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.SECRETARIA })
  rol: RolUsuario;

  @Column({ default: true })
  estaActivo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'desactivado_en' })
  desactivadoEn?: Date;
}
