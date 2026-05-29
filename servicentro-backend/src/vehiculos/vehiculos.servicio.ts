import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Vehiculo } from './vehiculo.entidad';
import { Cliente } from '../clientes/cliente.entidad';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';

@Injectable()
export class VehiculosServicio {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepo: Repository<Vehiculo>,
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async crear(dto: CrearVehiculoDto) {
    const cliente = await this.clientesRepo.findOne({
      where: { id: dto.clienteId },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no existe');
    }

    const placaExistente = await this.vehiculosRepo.findOne({
      where: { placa: dto.placa },
    });
    if (placaExistente) {
      throw new BadRequestException('La placa ya esta registrada');
    }

    const vehiculo = this.vehiculosRepo.create({
      cliente,
      placa: dto.placa.trim().toUpperCase(),
      marca: dto.marca,
      linea: dto.linea,
      modelo: dto.modelo,
      color: dto.color,
    });
    return this.vehiculosRepo.save(vehiculo);
  }

  listar(clienteId?: string) {
    const baseWhere: any = { desactivadoEn: IsNull() };
    const where = clienteId
      ? { ...baseWhere, cliente: { id: clienteId } }
      : baseWhere;
    return this.vehiculosRepo.find({
      where,
      order: { creadoEn: 'DESC' },
      relations: ['cliente'],
    });
  }

  async buscarPorId(id: string) {
    const vehiculo = await this.vehiculosRepo.findOne({
      where: { id, desactivadoEn: IsNull() },
      relations: ['cliente'],
    });
    if (!vehiculo) {
      throw new NotFoundException('Vehiculo no encontrado');
    }
    return vehiculo;
  }

  async actualizar(id: string, dto: ActualizarVehiculoDto) {
    const vehiculo = await this.buscarPorId(id);

    if (dto.clienteId && dto.clienteId !== vehiculo.cliente.id) {
      const cliente = await this.clientesRepo.findOne({
        where: { id: dto.clienteId },
      });
      if (!cliente) {
        throw new BadRequestException('Cliente no existe');
      }
      vehiculo.cliente = cliente;
    }

    if (dto.placa && dto.placa.toUpperCase() !== vehiculo.placa) {
      const placaExistente = await this.vehiculosRepo.findOne({
        where: { placa: dto.placa.toUpperCase() },
      });
      if (placaExistente) {
        throw new BadRequestException('La placa ya esta registrada');
      }
      vehiculo.placa = dto.placa.trim().toUpperCase();
    }

    if (dto.marca !== undefined) vehiculo.marca = dto.marca;
    if (dto.linea !== undefined) vehiculo.linea = dto.linea;
    if (dto.modelo !== undefined) vehiculo.modelo = dto.modelo;
    if (dto.color !== undefined) vehiculo.color = dto.color;

    return this.vehiculosRepo.save(vehiculo);
  }

  async eliminar(id: string) {
    const vehiculo = await this.buscarPorId(id);
    vehiculo.desactivadoEn = new Date();
    await this.vehiculosRepo.save(vehiculo);
    return { desactivado: true };
  }
}
