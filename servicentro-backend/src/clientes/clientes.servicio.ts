import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entidad';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesServicio {
  constructor(
    @InjectRepository(Cliente)
    private readonly repositorio: Repository<Cliente>,
  ) {}

  async crear(dto: CrearClienteDto) {
    // Unicidad por correo si viene definido
    if (dto.correo) {
      const existenteCorreo = await this.repositorio.findOne({
        where: { correo: dto.correo },
      });
      if (existenteCorreo)
        throw new BadRequestException('El correo ya esta registrado');
    }

    // Unicidad por NIT cuando aplica (ignorar CF y vacíos)
    const nit = (dto.nit || 'CF').trim();
    if (nit && nit.toUpperCase() !== 'CF') {
      const existenteNit = await this.repositorio.findOne({ where: { nit } });
      if (existenteNit)
        throw new BadRequestException('El NIT ya esta registrado');
    }

    try {
      const entidad = this.repositorio.create({ ...dto, nit });
      return await this.repositorio.save(entidad);
    } catch (e: any) {
      const code = e?.code ?? e?.driverError?.code;
      if (code === '23505') {
        // Detectar índice por mensaje no es 100% fiable; mensaje genérico claro
        throw new BadRequestException('Dato duplicado (correo o NIT)');
      }
      throw e;
    }
  }

  listar() {
    return this.repositorio.find({ order: { creadoEn: 'DESC' } });
  }

  async buscarPorId(id: string) {
    const cliente = await this.repositorio.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async actualizar(id: string, dto: ActualizarClienteDto) {
    const cliente = await this.buscarPorId(id);

    if (dto.correo && dto.correo !== cliente.correo) {
      const existenteCorreo = await this.repositorio.findOne({
        where: { correo: dto.correo },
      });
      if (existenteCorreo)
        throw new BadRequestException('El correo ya esta registrado');
    }

    if (
      dto.nit &&
      dto.nit.trim().toUpperCase() !== 'CF' &&
      dto.nit !== cliente.nit
    ) {
      const existenteNit = await this.repositorio.findOne({
        where: { nit: dto.nit },
      });
      if (existenteNit)
        throw new BadRequestException('El NIT ya esta registrado');
    }

    Object.assign(cliente, dto);
    try {
      return await this.repositorio.save(cliente);
    } catch (e: any) {
      const code = e?.code ?? e?.driverError?.code;
      if (code === '23505') {
        throw new BadRequestException('Dato duplicado (correo o NIT)');
      }
      throw e;
    }
  }

  async eliminar(id: string) {
    await this.buscarPorId(id);
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }
}
