import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CrearVehiculoDto {
  @IsUUID()
  clienteId: string;

  @IsString()
  placa: string;

  @IsString()
  marca: string;

  @IsString()
  linea: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
