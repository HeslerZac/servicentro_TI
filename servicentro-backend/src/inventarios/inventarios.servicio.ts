import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { Existencia } from './existencia.entidad';
import {
  MovimientoInventario,
  TipoMovimiento,
} from './movimiento-inventario.entidad';
import { CrearExistenciaDto } from './dto/crear-existencia.dto';
import { ActualizarExistenciaDto } from './dto/actualizar-existencia.dto';
import { AjustarInventarioDto } from './dto/ajustar-inventario.dto';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';

@Injectable()
export class InventariosServicio {
  constructor(private readonly dataSource: DataSource) {}

  private getExistenciasRepo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(Existencia)
      : this.dataSource.getRepository(Existencia);
  }

  private getProductosRepo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(Producto)
      : this.dataSource.getRepository(Producto);
  }

  private getBodegasRepo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(Bodega)
      : this.dataSource.getRepository(Bodega);
  }

  private getMovimientosRepo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(MovimientoInventario)
      : this.dataSource.getRepository(MovimientoInventario);
  }

  private calcularDisponible(existencia: Existencia) {
    return existencia.cantidad - existencia.cantidadReservada;
  }

  async crear(dto: CrearExistenciaDto) {
    const producto = await this.getProductosRepo().findOne({
      where: { id: dto.productoId },
    });
    if (!producto) throw new BadRequestException('Producto no existe');

    const bodega = await this.getBodegasRepo().findOne({
      where: { id: dto.bodegaId },
    });
    if (!bodega) throw new BadRequestException('Bodega no existe');

    const existente = await this.getExistenciasRepo().findOne({
      where: {
        producto: { id: dto.productoId },
        bodega: { id: dto.bodegaId },
      },
    });
    if (existente) {
      throw new BadRequestException(
        'Ya existe inventario para este producto en la bodega seleccionada',
      );
    }

    const entidad = this.getExistenciasRepo().create({
      producto,
      bodega,
      cantidad: dto.cantidad ?? 0,
      cantidadReservada: 0,
    });
    return this.getExistenciasRepo().save(entidad);
  }

  listar() {
    return this.getExistenciasRepo().find({
      where: { desactivadoEn: IsNull() },
      order: { actualizadaEn: 'DESC' },
    });
  }

  async buscarPorId(id: string) {
    const existencia = await this.getExistenciasRepo().findOne({
      where: { id, desactivadoEn: IsNull() },
    });
    if (!existencia) throw new NotFoundException('Inventario no encontrado');
    return existencia;
  }

  async actualizar(id: string, dto: ActualizarExistenciaDto) {
    if (dto.productoId || dto.bodegaId) {
      throw new BadRequestException(
        'No se permite cambiar productoId o bodegaId',
      );
    }

    const existencia = await this.buscarPorId(id);
    if (typeof dto.cantidad === 'number') {
      if (dto.cantidad < existencia.cantidadReservada) {
        throw new BadRequestException(
          'La cantidad no puede ser menor a lo ya reservado',
        );
      }
      existencia.cantidad = dto.cantidad;
    }
    return this.getExistenciasRepo().save(existencia);
  }

  async eliminar(id: string) {
    const existencia = await this.buscarPorId(id);
    if (existencia.cantidadReservada > 0) {
      throw new BadRequestException(
        'No se puede desactivar porque existen reservas activas',
      );
    }
    existencia.cantidad = 0;
    existencia.desactivadoEn = new Date();
    await this.getExistenciasRepo().save(existencia);
    return { desactivado: true };
  }

  async ajustar(dto: AjustarInventarioDto) {
    const producto = await this.getProductosRepo().findOne({
      where: { id: dto.productoId },
    });
    if (!producto) throw new BadRequestException('Producto no existe');

    const bodega = await this.getBodegasRepo().findOne({
      where: { id: dto.bodegaId },
    });
    if (!bodega) throw new BadRequestException('Bodega no existe');

    let existencia = await this.getExistenciasRepo().findOne({
      where: {
        producto: { id: dto.productoId },
        bodega: { id: dto.bodegaId },
        desactivadoEn: IsNull(),
      },
    });

    if (!existencia) {
      existencia = this.getExistenciasRepo().create({
        producto,
        bodega,
        cantidad: 0,
        cantidadReservada: 0,
      });
    }

    if (dto.tipo === TipoMovimiento.SALIDA) {
      const disponible = this.calcularDisponible(existencia);
      if (disponible < dto.cantidad) {
        throw new BadRequestException(
          'Inventario insuficiente para realizar la salida solicitada',
        );
      }
    }

    existencia.cantidad =
      dto.tipo === TipoMovimiento.ENTRADA
        ? existencia.cantidad + dto.cantidad
        : existencia.cantidad - dto.cantidad;
    await this.getExistenciasRepo().save(existencia);

    const movimiento = this.getMovimientosRepo().create({
      producto,
      bodega,
      tipo: dto.tipo,
      cantidad: dto.cantidad,
      motivo: dto.motivo,
    });
    await this.getMovimientosRepo().save(movimiento);

    return { existencia, movimiento };
  }

  listarMovimientos(productoId?: string, bodegaId?: string) {
    const filtros: Record<string, unknown> = {};
    if (productoId) filtros.producto = { id: productoId };
    if (bodegaId) filtros.bodega = { id: bodegaId };

    return this.getMovimientosRepo().find({
      where: filtros,
      order: { creadoEn: 'DESC' },
    });
  }

  async obtenerExistencia(
    productoId: string,
    bodegaId: string,
    manager?: EntityManager,
    options: { bloquear?: boolean; crearSiNoExiste?: boolean } = {},
  ) {
    const existenciasRepo = this.getExistenciasRepo(manager);
    const where = {
      producto: { id: productoId },
      bodega: { id: bodegaId },
    } as any;

    let existencia: Existencia | null = null;
    if (options.bloquear) {
      // Evitar LEFT JOINs al aplicar FOR UPDATE: filtrar por columnas FK directas
      existencia = await existenciasRepo
        .createQueryBuilder('e')
        .where('e."productoId" = :productoId', { productoId })
        .andWhere('e."bodegaId" = :bodegaId', { bodegaId })
        .andWhere('e."desactivado_en" IS NULL')
        .setLock('pessimistic_write')
        .getOne();
    } else {
      existencia = await existenciasRepo.findOne({
        where: { ...where, desactivadoEn: IsNull() },
      });
    }

    if (!existencia && options.crearSiNoExiste) {
      const producto = await this.getProductosRepo(manager).findOne({
        where: { id: productoId },
      });
      if (!producto) throw new BadRequestException('Producto no existe');
      const bodega = await this.getBodegasRepo(manager).findOne({
        where: { id: bodegaId },
      });
      if (!bodega) throw new BadRequestException('Bodega no existe');
      // Reutiliza una existencia desactivada si existe para mantener unicidad producto+bodega
      const vieja = await existenciasRepo.findOne({ where });
      if (vieja && (vieja as any).desactivadoEn) {
        (vieja as any).desactivadoEn = null;
        (vieja as any).cantidad = (vieja as any).cantidad ?? 0;
        (vieja as any).cantidadReservada =
          (vieja as any).cantidadReservada ?? 0;
        existencia = await existenciasRepo.save(vieja);
      } else {
        existencia = existenciasRepo.create({
          producto,
          bodega,
          cantidad: 0,
          cantidadReservada: 0,
        });
        existencia = await existenciasRepo.save(existencia);
      }
    }

    return existencia ?? null;
  }

  async reservar(
    productoId: string,
    bodegaId: string,
    cantidad: number,
    manager?: EntityManager,
  ) {
    const repo = this.getExistenciasRepo(manager);
    const existencia = await this.obtenerExistencia(
      productoId,
      bodegaId,
      manager,
      {
        bloquear: true,
        crearSiNoExiste: false,
      },
    );

    if (!existencia) {
      throw new BadRequestException(
        'No existe inventario disponible para reservar',
      );
    }

    const disponible = this.calcularDisponible(existencia);
    if (disponible < cantidad) {
      throw new BadRequestException('Inventario insuficiente para reservar');
    }

    existencia.cantidadReservada += cantidad;
    await repo.save(existencia);
    return existencia;
  }

  async liberarReserva(
    productoId: string,
    bodegaId: string,
    cantidad: number,
    manager?: EntityManager,
  ) {
    const repo = this.getExistenciasRepo(manager);
    const existencia = await this.obtenerExistencia(
      productoId,
      bodegaId,
      manager,
      {
        bloquear: true,
        crearSiNoExiste: false,
      },
    );

    if (!existencia) {
      throw new NotFoundException('Inventario no encontrado para liberar');
    }

    if (existencia.cantidadReservada < cantidad) {
      throw new BadRequestException(
        'La reserva a liberar excede la cantidad reservada',
      );
    }

    existencia.cantidadReservada -= cantidad;
    await repo.save(existencia);
    return existencia;
  }

  async consumirReserva(
    productoId: string,
    bodegaId: string,
    cantidad: number,
    manager?: EntityManager,
    motivo?: string,
  ) {
    const existenciasRepo = this.getExistenciasRepo(manager);
    const movimientosRepo = this.getMovimientosRepo(manager);
    const existencia = await this.obtenerExistencia(
      productoId,
      bodegaId,
      manager,
      {
        bloquear: true,
        crearSiNoExiste: false,
      },
    );

    if (!existencia) {
      throw new NotFoundException('Inventario no encontrado');
    }

    if (existencia.cantidadReservada < cantidad) {
      throw new BadRequestException(
        'La reserva es insuficiente para la operaci�n',
      );
    }

    if (existencia.cantidad < cantidad) {
      throw new BadRequestException('Inventario insuficiente para descontar');
    }

    existencia.cantidadReservada -= cantidad;
    existencia.cantidad -= cantidad;
    await existenciasRepo.save(existencia);

    const movimiento = movimientosRepo.create({
      producto: existencia.producto,
      bodega: existencia.bodega,
      tipo: TipoMovimiento.SALIDA,
      cantidad,
      motivo,
    });
    await movimientosRepo.save(movimiento);

    return { existencia, movimiento };
  }

  async obtenerTotalesProducto(productoId: string) {
    const existencias = await this.getExistenciasRepo().find({
      where: { producto: { id: productoId } },
    });
    const cantidadTotal = existencias.reduce(
      (acc, e) => acc + (e.cantidad || 0),
      0,
    );
    const reservadoTotal = existencias.reduce(
      (acc, e) => acc + (e.cantidadReservada || 0),
      0,
    );
    return { cantidadTotal, reservadoTotal };
  }

  async obtenerTotalesBodega(bodegaId: string) {
    const existencias = await this.getExistenciasRepo().find({
      where: { bodega: { id: bodegaId } },
    });
    const cantidadTotal = existencias.reduce(
      (acc, e) => acc + (e.cantidad || 0),
      0,
    );
    const reservadoTotal = existencias.reduce(
      (acc, e) => acc + (e.cantidadReservada || 0),
      0,
    );
    return { cantidadTotal, reservadoTotal };
  }
}
