import { IsString, IsOptional } from 'class-validator';

export class CrearProveedorDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  nit?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
