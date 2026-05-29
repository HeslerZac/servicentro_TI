import { IsOptional, IsString } from 'class-validator';

export class CierreCajaDto {
  @IsString()
  saldoRealEfectivo: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
