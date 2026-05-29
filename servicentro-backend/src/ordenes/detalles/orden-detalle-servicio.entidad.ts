import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdenServicio } from '../orden.entidad';

@Entity({ name: 'ordenes_detalles_servicio' })
export class OrdenDetalleServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrdenServicio, (orden) => orden.detallesServicio, {
    onDelete: 'CASCADE',
  })
  orden: OrdenServicio;

  @Column()
  descripcion: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  costo: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precio: string;

  @Column({ type: 'timestamp', name: 'desactivado_en', nullable: true })
  desactivadoEn?: Date;
}
