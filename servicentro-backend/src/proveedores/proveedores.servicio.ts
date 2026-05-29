import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './proveedor.entidad';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';

@Injectable()
export class ProveedoresServicio {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repositorio: Repository<Proveedor>,
  ) {}

  async crear(dto: CrearProveedorDto) {
    const existente = await this.repositorio.findOne({
      where: { nombre: dto.nombre },
    });
    if (existente)
      throw new BadRequestException('El nombre del proveedor ya existe');
    const entidad = this.repositorio.create(dto);
    return this.repositorio.save(entidad);
  }

  listar() {
    return this.repositorio.find({ order: { nombre: 'ASC' } });
  }

  async buscarPorId(id: string) {
    const proveedor = await this.repositorio.findOne({ where: { id } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor;
  }

  async actualizar(id: string, dto: ActualizarProveedorDto) {
    const proveedor = await this.buscarPorId(id);
    const actualizado = this.repositorio.merge(proveedor, dto);
    return this.repositorio.save(actualizado);
  }

  async eliminar(id: string) {
    await this.buscarPorId(id);
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }
}
