import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_CLAVE } from '../roles.decorador';
import { RolUsuario } from '../../usuarios/usuario.entidad';
import { DatosUsuarioToken } from '../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_CLAVE,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario: DatosUsuarioToken | undefined = request.user;

    if (!usuario) {
      return false;
    }

    return rolesRequeridos.includes(usuario.rol);
  }
}
