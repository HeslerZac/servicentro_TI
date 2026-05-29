import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../usuarios/usuario.entidad';

export const ROLES_CLAVE = 'roles';

export const Roles = (...roles: RolUsuario[]) =>
  SetMetadata(ROLES_CLAVE, roles);
