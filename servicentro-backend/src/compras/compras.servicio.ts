import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Compra } from './compra.entidad';
import { CompraDetalle } from './compra-detalle.entidad';
import { CrearCompraDto } from './dto/crear-compra.dto';
import { Proveedor } from '../proveedores/proveedor.entidad';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';
import { InventariosServicio } from '../inventarios/inventarios.servicio';
import { TipoMovimiento } from '../inventarios/movimiento-inventario.entidad';

@Injectable()
export class ComprasServicio {
  constructor(
    @InjectRepository(Compra) private readonly repositorio: Repository<Compra>,
    private readonly inventariosServicio: InventariosServicio,
    private readonly dataSource: DataSource,
  ) {}

  async crear(dto: CrearCompraDto) {
    return this.dataSource.transaction(async (manager) => {
      const proveedor = await manager.findOne(Proveedor, {
        where: { id: dto.proveedorId },
      });
      if (!proveedor) throw new BadRequestException('Proveedor no encontrado');

      const detalles: CompraDetalle[] = [];
      let total = 0;

      for (const detalleDto of dto.detalles) {
        const producto = await manager.findOne(Producto, {
          where: { id: detalleDto.productoId },
        });
        if (!producto)
          throw new BadRequestException(
            `Producto con id ${detalleDto.productoId} no encontrado`,
          );

        const bodega = await manager.findOne(Bodega, {
          where: { id: detalleDto.bodegaId },
        });
        if (!bodega)
          throw new BadRequestException(
            `Bodega con id ${detalleDto.bodegaId} no encontrada`,
          );

        const cantidad = Number(detalleDto.cantidad);
        const costoUnitario = Number(detalleDto.costoUnitario);
        const subtotal = cantidad * costoUnitario;
        total += subtotal;

        const detalle = manager.create(CompraDetalle, {
          producto,
          bodega,
          cantidad: String(cantidad),
          costoUnitario: String(costoUnitario),
          subtotal: String(subtotal),
        });
        detalles.push(detalle);

        await this.inventariosServicio.ajustar({
          productoId: producto.id,
          bodegaId: bodega.id,
          cantidad,
          tipo: TipoMovimiento.ENTRADA,
          motivo: `Compra a proveedor ${proveedor.nombre}`,
        });
      }

      const compra = manager.create(Compra, {
        proveedor,
        fecha: dto.fecha,
        total: String(total),
        detalles,
      });

      return manager.save(compra);
    });
  }
}
