import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import { CierreVenta } from './cierre-venta.entidad';
import { GenerarCierreDto } from './dto/generar-cierre.dto';
import { Venta } from '../ventas/venta.entidad';
import { DetalleVenta } from '../ventas/detalle-venta.entidad';

@Injectable()
export class CierresServicio {
  constructor(
    @InjectRepository(CierreVenta)
    private readonly cierresRepo: Repository<CierreVenta>,
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detallesRepo: Repository<DetalleVenta>,
    private readonly dataSource: DataSource,
  ) {}

  listar() {
    return this.cierresRepo.find({ order: { fechaInicio: 'DESC' } });
  }

  async generar(dto: GenerarCierreDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('El rango de fechas es invalido');
    }

    const clavePeriodo = `${dto.periodo}-${dto.fechaInicio}-${dto.fechaFin}`;

    return this.dataSource.transaction(async (manager) => {
      const repetido = await manager
        .getRepository(CierreVenta)
        .findOne({ where: { periodo: clavePeriodo } });
      if (repetido) {
        throw new BadRequestException(
          'Ya existe un cierre para el periodo indicado',
        );
      }

      const ventas = await manager.getRepository(Venta).find({
        where: { creadaEn: Between(fechaInicio, fechaFin) },
        relations: ['detalles'],
      });

      const totalVenta = ventas.reduce(
        (acc, venta) => acc + Number(venta.total),
        0,
      );
      const totalCosto = ventas.reduce((acc, venta) => {
        const costoVenta = venta.detalles.reduce((sum, detalle) => {
          const cantidad = Number(detalle.cantidad);
          const costo = Number(detalle.costoUnitario ?? 0);
          return sum + cantidad * costo;
        }, 0);
        return acc + costoVenta;
      }, 0);

      const cierre = manager.getRepository(CierreVenta).create({
        periodo: clavePeriodo,
        fechaInicio,
        fechaFin,
        totalCosto: totalCosto.toFixed(2),
        totalVenta: totalVenta.toFixed(2),
        totalGanancia: (totalVenta - totalCosto).toFixed(2),
        detalle: {
          ventas: ventas.map((venta) => ({ id: venta.id, total: venta.total })),
        },
      });

      return manager.getRepository(CierreVenta).save(cierre);
    });
  }
}
