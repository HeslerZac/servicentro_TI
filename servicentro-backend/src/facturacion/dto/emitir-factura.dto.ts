import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class FacturaDetalleDto {
  @IsString()
  descripcion: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  subtotal: number;
}

export class EmitirFacturaDto {
  @IsUUID()
  ventaId: string;

  @IsString()
  numero: string;

  @IsString()
  razonSocial: string;

  @IsString()
  nit: string;

  @IsString()
  direccion: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  formaPago?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FacturaDetalleDto)
  detalles?: FacturaDetalleDto[];
}
