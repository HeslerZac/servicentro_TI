import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DatosUsuarioToken } from './interfaces';

export const UsuarioActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): DatosUsuarioToken | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as DatosUsuarioToken | undefined;
  },
);
