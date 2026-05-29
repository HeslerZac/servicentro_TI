import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoMovimiento } from '../movimiento-inventario.entidad';

export class AjustarInventarioDto {
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsUUID()
  productoId: string;

  @IsUUID()
  bodegaId: string;

  @IsNumber()
  @Min(0.001)
  cantidad: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
