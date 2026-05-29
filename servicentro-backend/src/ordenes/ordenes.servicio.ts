import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { OrdenServicio, EstadoOrden } from './orden.entidad';
import { OrdenDetalleProducto } from './detalles/orden-detalle-producto.entidad';
import { OrdenDetalleServicio } from './detalles/orden-detalle-servicio.entidad';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarOrdenDto } from './dto/actualizar-orden.dto';
import { Cliente } from '../clientes/cliente.entidad';
import { Vehiculo } from '../vehiculos/vehiculo.entidad';
import { Usuario } from '../usuarios/usuario.entidad';
import { Producto } from '../productos/producto.entidad';
import { Bodega } from '../bodegas/bodega.entidad';
import { InventariosServicio } from '../inventarios/inventarios.servicio';
import { VentasServicio } from '../ventas/ventas.servicio';
import { Venta } from '../ventas/venta.entidad';
import { CajaServicio } from '../caja/caja.servicio';
const RELACIONES_ORDEN = [
  'cliente',
  'vehiculo',
  'usuarioResponsable',
  'detallesProducto',
  'detallesProducto.producto',
  'detallesProducto.bodega',
  'detallesServicio',
  'venta',
];

@Injectable()
export class OrdenesServicio {
  constructor(
    @InjectRepository(OrdenServicio)
    private readonly ordenesRepo: Repository<OrdenServicio>,
    private readonly dataSource: DataSource,
    private readonly inventariosServicio: InventariosServicio,
    private readonly ventasServicio: VentasServicio,
    private readonly cajaServicio: CajaServicio,
  ) {}
  listar() {
    // Evitar fallo por columnas faltantes en ventas durante listado
    return this.ordenesRepo.find({
      order: { creadaEn: 'DESC' },
      relations: ['cliente', 'vehiculo'],
    });
  }

  async buscarPorId(id: string) {
    const orden = await this.ordenesRepo.findOne({
      where: { id },
      relations: RELACIONES_ORDEN,
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    this.filtrarDetallesActivos(orden);
    return orden;
  }

  async crear(dto: CrearOrdenDto) {
    return this.dataSource.transaction(async (manager) => {
      await this.validarNumeroUnico(dto.numero, manager);
      const cliente = await this.obtenerCliente(dto.clienteId, manager);
      const vehiculo = dto.vehiculoId
        ? await this.obtenerVehiculo(dto.vehiculoId, manager)
        : undefined;
      const usuario = await this.obtenerUsuario(dto.usuarioId, manager);

      const ordenRepo = manager.getRepository(OrdenServicio);
      const detalleProdRepo = manager.getRepository(OrdenDetalleProducto);
      const detalleServRepo = manager.getRepository(OrdenDetalleServicio);

      // Crear cabecera con totales en 0
      let orden = ordenRepo.create({
        numero: dto.numero,
        cliente,
        vehiculo,
        usuarioResponsable: usuario,
        estado: dto.estado ?? EstadoOrden.EN_CURSO,
        observaciones: dto.observaciones,
        totalProductos: this.monetario(0),
        totalServicios: this.monetario(0),
        total: this.monetario(0),
      });

      // Guardar cabecera primero para obtener ID garantizado
      orden = await ordenRepo.save(orden);

      // Construir y guardar detalles explícitamente (evita UPDATE vacío en cascada)
      const detallesProducto = await this.mapearDetallesProducto(
        dto.productos ?? [],
        orden,
        manager,
      );
      const detallesServicio = this.mapearDetallesServicio(
        dto.servicios ?? [],
        orden,
        manager,
      );
      if (detallesProducto.length) await detalleProdRepo.save(detallesProducto);
      if (detallesServicio.length) await detalleServRepo.save(detallesServicio);

      // Recalcular totales y actualizar cabecera
      orden.detallesProducto = detallesProducto;
      orden.detallesServicio = detallesServicio;
      this.recalcularTotales(orden);
      const guardada = await ordenRepo.save(orden);
      const recien = await manager.getRepository(OrdenServicio).findOneOrFail({
        where: { id: guardada.id },
        relations: RELACIONES_ORDEN,
      });
      this.filtrarDetallesActivos(recien);
      return recien;
    });
  }

  async actualizar(id: string, dto: ActualizarOrdenDto) {
    return this.dataSource.transaction(async (manager) => {
      const ordenRepo = manager.getRepository(OrdenServicio);
      const orden = await ordenRepo.findOne({
        where: { id },
        relations: RELACIONES_ORDEN,
      });
      if (!orden) throw new NotFoundException('Orden no encontrada');
      if (orden.estado !== EstadoOrden.EN_CURSO) {
        throw new BadRequestException('Solo se pueden editar ordenes en curso');
      }

      if (dto.numero && dto.numero !== orden.numero) {
        await this.validarNumeroUnico(dto.numero, manager, orden.id);
        orden.numero = dto.numero;
      }

      if (dto.clienteId && dto.clienteId !== orden.cliente.id) {
        orden.cliente = await this.obtenerCliente(dto.clienteId, manager);
      }

      if (dto.vehiculoId !== undefined) {
        orden.vehiculo = dto.vehiculoId
          ? await this.obtenerVehiculo(dto.vehiculoId, manager)
          : undefined;
      }

      if (dto.usuarioId && dto.usuarioId !== orden.usuarioResponsable.id) {
        orden.usuarioResponsable = await this.obtenerUsuario(
          dto.usuarioId,
          manager,
        );
      }

      if (dto.observaciones !== undefined) {
        orden.observaciones = dto.observaciones;
      }

      if (dto.estado && dto.estado !== orden.estado) {
        if (
          ![EstadoOrden.EN_CURSO, EstadoOrden.CANCELADA].includes(dto.estado)
        ) {
          throw new BadRequestException(
            'El estado indicado no es valido para la actualizacion',
          );
        }
        orden.estado = dto.estado;
      }

      if (dto.productos) {
        await this.liberarReservas(orden.detallesProducto, manager);
        const repoDet = manager.getRepository(OrdenDetalleProducto);
        for (const det of orden.detallesProducto) {
          (det as any).desactivadoEn = new Date();
          await repoDet.save(det);
        }
        orden.detallesProducto = await this.mapearDetallesProducto(
          dto.productos,
          orden,
          manager,
        );
      }

      if (dto.servicios) {
        const repoServ = manager.getRepository(OrdenDetalleServicio);
        for (const det of orden.detallesServicio) {
          (det as any).desactivadoEn = new Date();
          await repoServ.save(det);
        }
        orden.detallesServicio = this.mapearDetallesServicio(
          dto.servicios,
          orden,
          manager,
        );
      }

      this.recalcularTotales(orden);
      const guardada = await ordenRepo.save(orden);
      const recien = await ordenRepo.findOneOrFail({
        where: { id: guardada.id },
        relations: RELACIONES_ORDEN,
      });
      this.filtrarDetallesActivos(recien);
      return recien;
    });
  }

  async cancelar(id: string, motivo?: string) {
    return this.dataSource.transaction(async (manager) => {
      const ordenRepo = manager.getRepository(OrdenServicio);
      const orden = await ordenRepo.findOne({
        where: { id },
        relations: RELACIONES_ORDEN,
      });
      if (!orden) throw new NotFoundException('Orden no encontrada');
      if (orden.estado !== EstadoOrden.EN_CURSO) {
        throw new BadRequestException(
          'Solo se pueden cancelar ordenes en curso',
        );
      }

      await this.liberarReservas(orden.detallesProducto, manager);
      orden.estado = EstadoOrden.CANCELADA;
      if (motivo) {
        orden.observaciones = [orden.observaciones, `Cancelada: ${motivo}`]
          .filter(Boolean)
          .join(' \n');
      }
      await ordenRepo.save(orden);
      return ordenRepo.findOneOrFail({
        where: { id: orden.id },
        relations: RELACIONES_ORDEN,
      });
    });
  }

  async finalizar(id: string, manager?: EntityManager) {
    const runner = async (runnerManager: EntityManager) => {
      const ordenRepo = runnerManager.getRepository(OrdenServicio);
      const orden = await ordenRepo.findOne({
        where: { id },
        relations: RELACIONES_ORDEN,
      });

      if (!orden) throw new NotFoundException('Orden no encontrada');
      if (orden.estado === EstadoOrden.FINALIZADA) return orden; // Ya está finalizada
      if (orden.estado !== EstadoOrden.EN_CURSO) {
        throw new BadRequestException(
          'Solo se pueden finalizar ordenes en curso',
        );
      }

      await this.consumirReservas(
        orden.detallesProducto,
        runnerManager,
        orden.numero,
      );
      const venta = await this.ventasServicio.registrarDesdeOrden(
        orden,
        runnerManager,
      );

      orden.estado = EstadoOrden.FINALIZADA;
      orden.venta = venta;
      await ordenRepo.save(orden);

      return ordenRepo.findOneOrFail({
        where: { id: orden.id },
        relations: RELACIONES_ORDEN,
      });
    };

    if (manager) return runner(manager); // Si ya estamos en una transacción, usar el manager existente
    return this.dataSource.transaction(runner); // Si no, crear una nueva transacción
  }

  async cobrar(
    id: string,
    dto: { formaPago: string; recibido?: string; cambio?: string },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const orden = await this.finalizar(id, manager);

      const total = Number(orden.total ?? 0);
      const recibido = dto.recibido != null ? Number(dto.recibido) : null;
      const cambio = dto.cambio != null ? Number(dto.cambio) : null;

      if (
        dto.formaPago === 'EFECTIVO' &&
        (recibido == null || recibido < total)
      ) {
        throw new BadRequestException(
          'Monto recibido insuficiente para efectivo',
        );
      }

      const sesion = await this.cajaServicio.sesionActual();
      if (!sesion) {
        throw new BadRequestException('Caja cerrada');
      }

      await this.cajaServicio.acumularVenta(dto.formaPago, total);

      // Actualizar la venta con los detalles del pago
      if (orden.venta) {
        await manager.getRepository(Venta).update(orden.venta.id, {
          formaPago: dto.formaPago,
          recibido: String(recibido),
          cambio: String(cambio),
        });
      }

      return orden;
    });
  }
  private async validarNumeroUnico(
    numero: string,
    manager: EntityManager,
    ignorarId?: string,
  ) {
    const existente = await manager
      .getRepository(OrdenServicio)
      .findOne({ where: { numero } });
    if (existente && existente.id !== ignorarId) {
      throw new BadRequestException('El numero de orden ya esta registrado');
    }
  }

  private async obtenerCliente(id: string, manager: EntityManager) {
    const cliente = await manager
      .getRepository(Cliente)
      .findOne({ where: { id, desactivadoEn: IsNull() } });
    if (!cliente) throw new BadRequestException('Cliente no existe');
    return cliente;
  }

  private async obtenerVehiculo(id: string, manager: EntityManager) {
    const vehiculo = await manager.getRepository(Vehiculo).findOne({
      where: { id, desactivadoEn: IsNull() },
      relations: ['cliente'],
    });
    if (!vehiculo) throw new BadRequestException('Vehiculo no existe');
    return vehiculo;
  }

  private async obtenerUsuario(id: string, manager: EntityManager) {
    const usuario = await manager
      .getRepository(Usuario)
      .findOne({ where: { id, desactivadoEn: IsNull() } });
    if (!usuario)
      throw new BadRequestException('Usuario responsable no existe');
    return usuario;
  }

  private async mapearDetallesProducto(
    detalles: CrearOrdenDto['productos'],
    orden: OrdenServicio,
    manager: EntityManager,
  ) {
    const repo = manager.getRepository(OrdenDetalleProducto);
    const resultado: OrdenDetalleProducto[] = [];

    for (const detalleDto of detalles) {
      const producto = await manager.getRepository(Producto).findOne({
        where: { id: detalleDto.productoId, desactivadoEn: IsNull() },
      });
      if (!producto) throw new BadRequestException('Producto no existe');
      const bodega = await manager.getRepository(Bodega).findOne({
        where: { id: detalleDto.bodegaId, desactivadoEn: IsNull() },
      });
      if (!bodega) throw new BadRequestException('Bodega no existe');

      const cantidad = this.numeroCantidad(detalleDto.cantidad, 'cantidad');
      const costoUnitario = this.numeroMoneda(
        detalleDto.costoUnitario,
        'costoUnitario',
      );
      const precioUnitario = this.numeroMoneda(
        detalleDto.precioUnitario,
        'precioUnitario',
      );
      await this.inventariosServicio.reservar(
        producto.id,
        bodega.id,
        cantidad,
        manager,
      );

      const subtotal = cantidad * precioUnitario;
      const detalle = repo.create({
        orden,
        producto,
        bodega,
        cantidad: this.cantidadTexto(cantidad),
        costoUnitario: this.monetario(costoUnitario),
        precioUnitario: this.monetario(precioUnitario),
        subtotal: this.monetario(subtotal),
      });
      resultado.push(detalle);
    }

    return resultado;
  }

  private mapearDetallesServicio(
    detalles: CrearOrdenDto['servicios'],
    orden: OrdenServicio,
    manager: EntityManager,
  ) {
    const repoDetalle = manager.getRepository(OrdenDetalleServicio);
    return detalles.map((detalle) => {
      const costo = this.numeroMoneda(detalle.costo, 'costo');
      const precio = this.numeroMoneda(detalle.precio, 'precio');
      return repoDetalle.create({
        orden,
        descripcion: detalle.descripcion,
        costo: this.monetario(costo),
        precio: this.monetario(precio),
      });
    });
  }

  private async liberarReservas(
    detalles: OrdenDetalleProducto[],
    manager: EntityManager,
  ) {
    for (const detalle of detalles) {
      const cantidad = Number(detalle.cantidad);
      await this.inventariosServicio.liberarReserva(
        detalle.producto.id,
        detalle.bodega.id,
        cantidad,
        manager,
      );
    }
  }

  private async consumirReservas(
    detalles: OrdenDetalleProducto[],
    manager: EntityManager,
    numeroOrden?: string,
  ) {
    const motivo = numeroOrden ? `Salida por orden ${numeroOrden}` : undefined;
    for (const detalle of detalles) {
      const cantidad = Number(detalle.cantidad);
      await this.inventariosServicio.consumirReserva(
        detalle.producto.id,
        detalle.bodega.id,
        cantidad,
        manager,
        motivo,
      );
    }
  }

  private recalcularTotales(orden: OrdenServicio) {
    const totalProductos = orden.detallesProducto
      .filter((d: any) => !d.desactivadoEn)
      .reduce((acc, det) => acc + Number(det.subtotal), 0);
    const totalServicios = orden.detallesServicio
      .filter((d: any) => !d.desactivadoEn)
      .reduce((acc, det) => acc + Number(det.precio), 0);
    orden.totalProductos = this.monetario(totalProductos);
    orden.totalServicios = this.monetario(totalServicios);
    orden.total = this.monetario(totalProductos + totalServicios);
  }

  private filtrarDetallesActivos(orden: OrdenServicio) {
    (orden as any).detallesProducto = (orden.detallesProducto ?? []).filter(
      (d: any) => !d.desactivadoEn,
    );
    (orden as any).detallesServicio = (orden.detallesServicio ?? []).filter(
      (d: any) => !d.desactivadoEn,
    );
  }

  private monetario(valor: number) {
    return valor.toFixed(2);
  }

  private cantidadTexto(valor: number) {
    return valor.toFixed(3);
  }

  private numeroCantidad(valor: string, campo: string) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) {
      throw new BadRequestException(
        `El campo ${campo} debe ser un numero mayor a cero`,
      );
    }
    return numero;
  }

  private numeroMoneda(valor: string, campo: string) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) {
      throw new BadRequestException(
        `El campo ${campo} debe ser un numero valido`,
      );
    }
    return numero;
  }
}
