import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega } from './bodega.entidad';
import { CrearBodegaDto } from './dto/crear-bodega.dto';
import { ActualizarBodegaDto } from './dto/actualizar-bodega.dto';
import { InventariosServicio } from '../inventarios/inventarios.servicio';

@Injectable()
export class BodegasServicio {
  constructor(
    @InjectRepository(Bodega) private readonly repositorio: Repository<Bodega>,
    private readonly inventarios: InventariosServicio,
  ) {}

  async crear(dto: CrearBodegaDto) {
    const existente = await this.repositorio.findOne({
      where: { codigo: dto.codigo },
    });
    if (existente)
      throw new BadRequestException('El codigo de bodega ya existe');
    const entidad = this.repositorio.create(dto);
    return this.repositorio.save(entidad);
  }

  listar() {
    return this.repositorio.find({ order: { nombre: 'ASC' } });
  }

  async buscarPorId(id: string) {
    const bodega = await this.repositorio.findOne({ where: { id } });
    if (!bodega) throw new NotFoundException('Bodega no encontrada');
    return bodega;
  }

  async actualizar(id: string, dto: ActualizarBodegaDto) {
    const bodega = await this.buscarPorId(id);
    if (dto.codigo && dto.codigo !== bodega.codigo) {
      const existente = await this.repositorio.findOne({
        where: { codigo: dto.codigo },
      });
      if (existente)
        throw new BadRequestException('El codigo de bodega ya existe');
    }
    Object.assign(bodega, dto);
    return this.repositorio.save(bodega);
  }

  async eliminar(id: string) {
    const bodega = await this.buscarPorId(id);
    const totales = await this.inventarios.obtenerTotalesBodega(bodega.id);
    if (totales.cantidadTotal > 0 || totales.reservadoTotal > 0) {
      throw new BadRequestException(
        'No se puede desactivar: existen existencias o reservas en la bodega',
      );
    }
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }
}
