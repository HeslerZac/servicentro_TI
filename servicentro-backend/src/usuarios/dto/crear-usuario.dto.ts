import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RolUsuario } from '../usuario.entidad';

export class CrearUsuarioDto {
  @IsString()
  nombreUsuario: string;

  @IsString()
  nombre: string;

  @IsString()
  telefono: string;

  @IsString()
  direccion: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean;
}
