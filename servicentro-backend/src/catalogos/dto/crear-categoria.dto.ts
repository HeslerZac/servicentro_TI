import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CrearCategoriaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  estaActiva?: boolean;
}
