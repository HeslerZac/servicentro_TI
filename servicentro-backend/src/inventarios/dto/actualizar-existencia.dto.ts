import { IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class ActualizarExistenciaDto {
  @IsOptional()
  @IsUUID()
  productoId?: string;

  @IsOptional()
  @IsUUID()
  bodegaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;
}
