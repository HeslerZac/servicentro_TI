import { RolUsuario } from '../usuarios/usuario.entidad';

export interface DatosUsuarioToken {
  id: string;
  nombreUsuario: string;
  rol: RolUsuario;
}

export interface PayloadJwt {
  sub: string;
  nombreUsuario: string;
  rol: RolUsuario;
}
