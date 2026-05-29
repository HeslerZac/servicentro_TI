import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Categoria } from './categoria.entidad';
import { Marca } from './marca.entidad';

@Entity({ name: 'categorias_marcas' })
@Unique(['categoria', 'marca'])
export class CategoriaMarca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Categoria, { eager: true, onDelete: 'CASCADE' })
  categoria: Categoria;

  @ManyToOne(() => Marca, { eager: true, onDelete: 'CASCADE' })
  marca: Marca;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
