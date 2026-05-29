import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosServicio } from '../usuarios/usuarios.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { PayloadJwt } from './interfaces';

@Injectable()
export class AutenticacionServicio {
  private readonly expiracion: number;

  constructor(
    private readonly usuariosServicio: UsuariosServicio,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.expiracion = this.resolverExpiracion(
      configService.get<string>('JWT_EXPIRACION'),
    );
  }

  async iniciarSesion(dto: IniciarSesionDto) {
    const usuario = await this.usuariosServicio.validarCredenciales(
      dto.usuario,
      dto.contrasena,
    );

    if (!usuario.estaActivo) {
      throw new BadRequestException('El usuario esta desactivado');
    }

    const payload: PayloadJwt = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.expiracion,
    });

    return {
      tipo: 'Bearer',
      token,
      expiraEn: this.expiracion,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
      },
    };
  }

  private resolverExpiracion(valor?: string): number {
    if (!valor) return 3600;
    const comoNumero = Number(valor);
    return Number.isNaN(comoNumero) ? 3600 : comoNumero;
  }
}
