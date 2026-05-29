import { IsString, MinLength } from 'class-validator';

export class ActualizarContrasenaDto {
  @IsString()
  @MinLength(6)
  contrasena: string;
}
