import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class CrearProductoDto {
  @IsString()
  codigo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  marca?: string;

  // Relaciones por ID (FK)
  @IsOptional()
  @IsUUID()
  marcaId?: string;

  @IsOptional()
  @IsString()
  medida?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  // Stock inicial (opcional) al crear
  @IsOptional()
  @IsUUID()
  bodegaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockInicial?: number;

  @Type(() => Number)
  @IsNumber()
  costo: number;

  // Si el cliente envia numeros como texto, @Type los convierte a number
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioA?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioB?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMayorista?: number;

  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;
}
