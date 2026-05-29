import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum FormaPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export class CobrarOrdenDto {
  @IsEnum(FormaPago)
  formaPago!: FormaPago;

  // Solo para efectivo; enviados como string para consistencia con numeric
  @IsOptional()
  @IsNumberString()
  recibido?: string;

  @IsOptional()
  @IsNumberString()
  cambio?: string;

  @IsOptional()
  @IsString()
  referencia?: string;
}
