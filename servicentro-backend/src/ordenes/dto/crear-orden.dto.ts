import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { EstadoOrden } from '../orden.entidad';

class DetalleProductoDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  bodegaId: string;

  @IsString()
  cantidad: string;

  @IsString()
  costoUnitario: string;

  @IsString()
  precioUnitario: string;
}

class DetalleServicioDto {
  @IsString()
  descripcion: string;

  @IsString()
  costo: string;

  @IsString()
  precio: string;
}

export class CrearOrdenDto {
  @IsString()
  numero: string;

  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsUUID()
  vehiculoId?: string;

  @IsUUID()
  usuarioId: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleProductoDto)
  productos: DetalleProductoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleServicioDto)
  servicios: DetalleServicioDto[];
}
