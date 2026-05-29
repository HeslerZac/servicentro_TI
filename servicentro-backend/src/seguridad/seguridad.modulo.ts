import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AutenticacionControlador } from './autenticacion.controlador';
import { AutenticacionServicio } from './autenticacion.servicio';
import { UsuariosModulo } from '../usuarios/usuarios.modulo';
import { JwtEstrategia } from './estrategias/jwt.estrategia';
import { JwtAutenticacionGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

function resolverExpiracion(valor?: string): number {
  if (!valor) return 3600;
  const comoNumero = Number(valor);
  return Number.isNaN(comoNumero) ? 3600 : comoNumero;
}

@Global()
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRETO', 'cambio-este-secreto'),
        signOptions: {
          expiresIn: resolverExpiracion(
            configService.get<string>('JWT_EXPIRACION'),
          ),
        },
      }),
    }),
    UsuariosModulo,
  ],
  controllers: [AutenticacionControlador],
  providers: [
    AutenticacionServicio,
    JwtEstrategia,
    JwtAutenticacionGuard,
    RolesGuard,
  ],
  exports: [
    AutenticacionServicio,
    JwtAutenticacionGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class SeguridadModulo {}
