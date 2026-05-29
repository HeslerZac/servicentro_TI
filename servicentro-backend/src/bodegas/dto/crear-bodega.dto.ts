import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CrearBodegaDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsBoolean()
  estaActiva?: boolean;
}
