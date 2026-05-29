import { IsString } from 'class-validator';

export class AperturaCajaDto {
  @IsString()
  saldoInicialEfectivo: string;
}
