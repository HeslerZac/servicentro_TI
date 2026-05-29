import { IsUUID, IsNumber, Min } from 'class-validator';

export class CrearExistenciaDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  bodegaId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;
}
