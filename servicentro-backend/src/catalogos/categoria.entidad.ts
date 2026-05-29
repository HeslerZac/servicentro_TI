import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion?: string;

  @Column({ default: true })
  estaActiva: boolean;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
