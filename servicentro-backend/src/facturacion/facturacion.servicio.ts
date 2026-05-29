import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Factura } from './factura.entidad';
import { EmitirFacturaDto } from './dto/emitir-factura.dto';
import { Venta } from '../ventas/venta.entidad';

@Injectable()
export class FacturacionServicio {
  constructor(
    @InjectRepository(Factura)
    private readonly facturasRepo: Repository<Factura>,
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    private readonly dataSource: DataSource,
  ) {}

  listar() {
    return this.facturasRepo.find({ order: { emitidaEn: 'DESC' } });
  }

  async emitir(dto: EmitirFacturaDto) {
    return this.dataSource.transaction(async (manager) => {
      const venta = await manager.getRepository(Venta).findOne({
        where: { id: dto.ventaId },
        relations: ['cliente', 'orden', 'orden.vehiculo'],
      });
      if (!venta) throw new BadRequestException('La venta indicada no existe');

      if (!venta.cliente) {
        throw new BadRequestException(
          'La venta no tiene un cliente asociado para facturar',
        );
      }

      const existente = await manager
        .getRepository(Factura)
        .findOne({ where: { venta: { id: venta.id } } });
      if (existente) {
        throw new BadRequestException(
          'La venta ya cuenta con una factura emitida',
        );
      }

      const factura = manager.getRepository(Factura).create({
        numero: dto.numero,
        venta,
        cliente: venta.cliente,
        razonSocial: dto.razonSocial,
        nit: dto.nit,
        direccion: dto.direccion,
        total: venta.total,
        datosNegocio: {
          fecha: dto.fecha,
          formaPago: dto.formaPago,
          detalles: dto.detalles ?? null,
        },
        datosVehiculo: venta.orden?.vehiculo
          ? {
              placa: venta.orden.vehiculo.placa,
              marca: venta.orden.vehiculo.marca,
              linea: venta.orden.vehiculo.linea,
              modelo: venta.orden.vehiculo.modelo,
              color: venta.orden.vehiculo.color,
            }
          : undefined,
      });

      return manager.getRepository(Factura).save(factura);
    });
  }
}
