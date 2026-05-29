import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  nit?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;
}
