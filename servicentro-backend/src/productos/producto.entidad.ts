import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Existencia } from '../inventarios/existencia.entidad';
import { Marca } from '../catalogos/marca.entidad';
import { Categoria } from '../catalogos/categoria.entidad';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) codigo: string;
  @Column() descripcion: string;
  @Column({ nullable: true }) medida?: string;

  @ManyToOne(() => Marca, { nullable: true })
  @JoinColumn({ name: 'marcaId' })
  marca?: Marca | null;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'categoriaId' })
  categoria?: Categoria | null;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costo: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 }) precioA: string;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) precioB: string;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precioMayorista: string;

  @OneToMany(() => Existencia, (existencia) => existencia.producto)
  existencias: Existencia[];

  @CreateDateColumn() creadoEn: Date;
  @UpdateDateColumn() actualizadoEn: Date;

  @DeleteDateColumn({ name: 'desactivado_en' })
  desactivadoEn?: Date;
}
