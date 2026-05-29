import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entidad';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { InventariosServicio } from '../inventarios/inventarios.servicio';
import { TipoMovimiento } from '../inventarios/movimiento-inventario.entidad';
import { BuscarProductosDto } from './dto/buscar-productos.dto';

@Injectable()
export class ProductosServicio {
  constructor(
    @InjectRepository(Producto)
    private readonly repositorio: Repository<Producto>,
    private readonly inventarios: InventariosServicio,
  ) {}

  async crear(dto: CrearProductoDto) {
    const existente = await this.repositorio.findOne({
      where: { codigo: dto.codigo },
    });
    if (existente) throw new BadRequestException('El codigo ya existe');
    try {
      // Adaptar: si el DTO trae 'marca' como texto, ignorarlo en este punto
      // porque la entidad ahora usa relación ManyToOne a Marca.
      const resto: any = { ...dto };
      // Campos antiguos o no mapeados directamente
      delete resto.marca; // texto antiguo
      const { marcaId, categoriaId, bodegaId, stockInicial } = resto;
      delete resto.marcaId;
      delete resto.categoriaId;
      delete resto.bodegaId;
      delete resto.stockInicial;

      const entidad = this.repositorio.create({
        ...resto,
        costo: String(dto.costo ?? 0),
        precioA: String(dto.precioA ?? 0),
        precioB: String(dto.precioB ?? 0),
        precioMayorista: String(dto.precioMayorista ?? 0),
      });

      if (marcaId) (entidad as any).marca = { id: marcaId } as any;
      if (categoriaId) (entidad as any).categoria = { id: categoriaId } as any;
      const guardado: any = await this.repositorio.save(entidad as any);

      if (bodegaId && Number(stockInicial) > 0) {
        try {
          await this.inventarios.ajustar({
            productoId: guardado.id as string,
            bodegaId,
            tipo: TipoMovimiento.ENTRADA,
            cantidad: Number(stockInicial),
            motivo: 'Stock inicial (alta de producto)',
          } as any);
        } catch (e) {
          // no bloquear creación de producto si el inventario falla
        }
      }
      return guardado;
    } catch (e: any) {
      const code = e?.code ?? e?.driverError?.code;
      if (code === '23505') {
        throw new BadRequestException('El codigo ya existe');
      }
      throw e;
    }
  }

  async listar(dto: BuscarProductosDto) {
    return this.buscarConStock(dto);
  }

  async buscarConStock(dto: BuscarProductosDto) {
    const qb = this.repositorio
      .createQueryBuilder('producto')
      // Seleccionamos Marca/Categoría para que el frontend tenga nombre/ids
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.existencias', 'existencia')
      .leftJoinAndSelect('existencia.bodega', 'bodega');

    // Excluir registros desactivados explícitamente al usar QueryBuilder
    qb.andWhere('producto."desactivado_en" IS NULL');

    if (dto.search) {
      qb.andWhere(
        '(producto.codigo ILIKE :search OR producto.descripcion ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.brand) {
      qb.andWhere('marca.nombre = :brand', { brand: dto.brand });
    }

    if (dto.category) {
      qb.andWhere('categoria.nombre = :category', { category: dto.category });
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const [productos, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const resultado = productos.map((p) => {
      const stockPorBodega = (p.existencias ?? [])
        .filter((e) => !!e)
        .map((e) => ({
          bodegaId: (e as any)?.bodega?.id ?? null,
          nombreBodega: (e as any)?.bodega?.nombre ?? null,
          cantidad: Number((e as any)?.cantidad ?? 0),
        }))
        // filtrar filas sin bodega si no aportan datos
        .filter((row) => row.bodegaId !== null);

      const stockTotal = stockPorBodega.reduce(
        (acc, it) => acc + Number(it.cantidad || 0),
        0,
      );

      return {
        ...p,
        marca: (p as any).marca?.nombre ?? null,
        categoria: (p as any).categoria?.nombre ?? null,
        stockPorBodega,
        stockTotal,
      } as any;
    });

    return {
      items: resultado,
      total,
      page,
      limit,
    };
  }

  async buscarPorId(id: string) {
    const producto = await this.repositorio.findOne({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async actualizar(id: string, dto: ActualizarProductoDto) {
    const producto = await this.buscarPorId(id);
    const resto: any = { ...dto };
    delete resto.marca; // compat texto
    const { marcaId, categoriaId } = resto;
    delete resto.marcaId;
    delete resto.categoriaId;

    Object.assign(producto, {
      ...resto,
      ...(dto.precioA !== undefined ? { precioA: String(dto.precioA) } : {}),
      ...(dto.precioB !== undefined ? { precioB: String(dto.precioB) } : {}),
      ...(dto.precioMayorista !== undefined
        ? { precioMayorista: String(dto.precioMayorista) }
        : {}),
      ...((dto as any).costo !== undefined
        ? { costo: String((dto as any).costo) }
        : {}),
    });

    if (marcaId !== undefined) {
      (producto as any).marca = marcaId ? ({ id: marcaId } as any) : null;
    }
    if (categoriaId !== undefined) {
      (producto as any).categoria = categoriaId
        ? ({ id: categoriaId } as any)
        : null;
    }
    try {
      return await this.repositorio.save(producto);
    } catch (e: any) {
      const code = e?.code ?? e?.driverError?.code;
      if (code === '23505') {
        throw new BadRequestException('El codigo ya existe');
      }
      throw e;
    }
  }

  async eliminar(id: string) {
    const producto = await this.buscarPorId(id);
    const totales = await this.inventarios.obtenerTotalesProducto(producto.id);
    if (totales.cantidadTotal > 0 || totales.reservadoTotal > 0) {
      throw new BadRequestException(
        'No se puede desactivar: el stock total o reservado es mayor a 0',
      );
    }
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }
}
