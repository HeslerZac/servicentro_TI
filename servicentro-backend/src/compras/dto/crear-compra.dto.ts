import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsUUID,
  ValidateNested,
  IsNumberString,
} from 'class-validator';

class DetalleCompraDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  bodegaId: string;

  @IsNumberString()
  cantidad: string;

  @IsNumberString()
  costoUnitario: string;
}

export class CrearCompraDto {
  @IsUUID()
  proveedorId: string;

  @IsDateString()
  fecha: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[];
}
