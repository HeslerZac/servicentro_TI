import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../ventas/venta.entidad';
import { DetalleVenta } from '../ventas/detalle-venta.entidad';
import { OrdenServicio, EstadoOrden } from '../ordenes/orden.entidad';
import { Existencia } from '../inventarios/existencia.entidad';
import { Producto } from '../productos/producto.entidad';

@Injectable()
export class DashboardServicio {
  constructor(
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detallesRepo: Repository<DetalleVenta>,
    @InjectRepository(OrdenServicio)
    private readonly ordenesRepo: Repository<OrdenServicio>,
    @InjectRepository(Existencia)
    private readonly existenciasRepo: Repository<Existencia>,
    @InjectRepository(Producto)
    private readonly productosRepo: Repository<Producto>,
  ) {}

  async kpis(stockMinimo?: number) {
    const hoy = new Date();
    const inicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      0,
      0,
      0,
      0,
    );
    const fin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      23,
      59,
      59,
      999,
    );

    const ventasDelDia = await this.ventasRepo
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.total), 0)', 'total')
      .where('v.creadaEn BETWEEN :ini AND :fin', { ini: inicio, fin })
      .getRawOne<{ total: string }>()
      .then((r) => Number(r?.total ?? 0));

    const ordenesEnCurso = await this.ordenesRepo.count({
      where: { estado: EstadoOrden.EN_CURSO },
    });

    const umbral =
      Number.isFinite(Number(stockMinimo)) && Number(stockMinimo) >= 0
        ? Number(stockMinimo)
        : Number(process.env.DASHBOARD_STOCK_MINIMO ?? 5);

    const productosBajoStock = await this.existenciasRepo
      .createQueryBuilder('e')
      .innerJoinAndSelect('e.producto', 'p')
      .innerJoinAndSelect('e.bodega', 'b')
      .where('p.desactivadoEn IS NULL')
      .andWhere('e.cantidad <= :umbral', { umbral })
      .select(['p.id', 'p.descripcion', 'b.nombre', 'e.cantidad'])
      .getRawMany();

    return { ventasDelDia, ordenesEnCurso, productosBajoStock, umbral };
  }

  async ventasUltimos30Dias() {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 29);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      23,
      59,
      59,
      999,
    );

    const filas = await this.ventasRepo
      .createQueryBuilder('v')
      .select("TO_CHAR(v.creadaEn, 'YYYY-MM-DD')", 'fecha')
      .addSelect('SUM(v.total)', 'total')
      .where('v.creadaEn BETWEEN :ini AND :fin', { ini: inicio, fin })
      .groupBy("TO_CHAR(v.creadaEn, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(v.creadaEn, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<{ fecha: string; total: string }>();

    // Normaliza días sin ventas a 0
    const mapa = new Map(filas.map((f) => [f.fecha, Number(f.total)]));
    const resultado: { fecha: string; total: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      const clave = fecha.toISOString().substring(0, 10);
      resultado.push({ fecha: clave, total: mapa.get(clave) ?? 0 });
    }
    return resultado;
  }

  async productosMasVendidos(limite = 10, dias = 30) {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - (dias - 1));
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      23,
      59,
      59,
      999,
    );

    const filas = await this.detallesRepo
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .leftJoin('d.producto', 'p')
      .where('v.creadaEn BETWEEN :ini AND :fin', { ini: inicio, fin })
      .andWhere('p.id IS NOT NULL')
      .andWhere('COALESCE(p.desactivado_en, NULL) IS NULL')
      .select('p.id', 'productoId')
      .addSelect('p.descripcion', 'descripcion')
      .addSelect('SUM(d.cantidad)', 'cantidad')
      .addSelect('SUM(d.subtotal)', 'total')
      .groupBy('p.id')
      .addGroupBy('p.descripcion')
      .orderBy('SUM(d.cantidad)', 'DESC')
      .limit(Math.max(1, Math.min(100, Number(limite) || 10)))
      .getRawMany<{
        productoId: string;
        descripcion: string;
        cantidad: string;
        total: string;
      }>();

    return filas.map((f) => ({
      productoId: f.productoId,
      descripcion: f.descripcion,
      cantidad: Number(f.cantidad),
      total: Number(f.total),
    }));
  }
}
