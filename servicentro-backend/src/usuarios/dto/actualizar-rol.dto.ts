import { IsEnum } from 'class-validator';
import { RolUsuario } from '../usuario.entidad';

export class ActualizarRolDto {
  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
