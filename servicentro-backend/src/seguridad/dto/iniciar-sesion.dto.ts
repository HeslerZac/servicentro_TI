import { IsString } from 'class-validator';

export class IniciarSesionDto {
  @IsString()
  usuario: string;

  @IsString()
  contrasena: string;
}
