import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CajaSesion } from './caja.entidad';
import { AperturaCajaDto } from './dto/apertura-caja.dto';
import { CierreCajaDto } from './dto/cierre-caja.dto';
import { Venta } from '../ventas/venta.entidad';

@Injectable()
export class CajaServicio {
  constructor(
    @InjectRepository(CajaSesion)
    private readonly repo: Repository<CajaSesion>,
    @InjectRepository(Venta)
    private readonly ventasRepo: Repository<Venta>,
  ) {}

  async sesionActual() {
    return this.repo.findOne({ where: { estado: 'ABIERTA' } });
  }

  async abrir(dto: AperturaCajaDto) {
    const abierta = await this.sesionActual();
    if (abierta) throw new BadRequestException('Ya hay una caja abierta');
    const saldoInicial = Number(dto.saldoInicialEfectivo ?? 0);
    const ent = this.repo.create({
      estado: 'ABIERTA',
      saldoInicialEfectivo: saldoInicial.toFixed(2),
      saldoTeoricoEfectivo: saldoInicial.toFixed(2),
      totalEfectivo: '0.00',
      totalTarjeta: '0.00',
      totalTransfer: '0.00',
    });
    return this.repo.save(ent);
  }

  async cerrar(dto: CierreCajaDto) {
    const abierta = await this.sesionActual();
    if (!abierta) throw new NotFoundException('No hay caja abierta');
    const real = Number(dto.saldoRealEfectivo ?? 0);
    const teorico = Number(abierta.saldoTeoricoEfectivo ?? 0);
    abierta.estado = 'CERRADA';
    abierta.fechaCierre = new Date();
    abierta.saldoRealEfectivo = real.toFixed(2);
    abierta.diferencia = (real - teorico).toFixed(2);
    return this.repo.save(abierta);
  }

  async acumularVenta(formaPago: string, total: number) {
    const abierta = await this.sesionActual();
    if (!abierta) throw new BadRequestException('Caja cerrada');
    if (formaPago === 'EFECTIVO') {
      abierta.totalEfectivo = (
        Number(abierta.totalEfectivo || 0) + total
      ).toFixed(2);
      abierta.saldoTeoricoEfectivo = (
        Number(abierta.saldoTeoricoEfectivo || 0) + total
      ).toFixed(2);
    } else if (formaPago === 'TARJETA') {
      abierta.totalTarjeta = (
        Number(abierta.totalTarjeta || 0) + total
      ).toFixed(2);
    } else if (formaPago === 'TRANSFERENCIA') {
      abierta.totalTransfer = (
        Number(abierta.totalTransfer || 0) + total
      ).toFixed(2);
    }
    await this.repo.save(abierta);
    return abierta;
  }

  async resumenActual() {
    const s = await this.sesionActual();
    if (!s) return null;
    const countRow = await this.ventasRepo
      .createQueryBuilder('v')
      .select('COUNT(1)', 'count')
      .where('v.cajasesionid = :id', { id: s.id })
      .getRawOne<{ count: string }>();
    const raw = await this.ventasRepo
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.total),0)', 'sum')
      .where('v.cajasesionid = :id', { id: s.id })
      .getRawOne<{ sum: string }>();
    return {
      sesion: s,
      ventasCount: Number(countRow?.count || 0),
      ventasTotal: raw?.sum ?? '0',
    };
  }
}
