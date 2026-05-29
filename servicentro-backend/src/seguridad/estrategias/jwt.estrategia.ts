import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadJwt } from '../interfaces';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRETO',
        'cambio-este-secreto',
      ),
    });
  }

  validate(payload: PayloadJwt) {
    return {
      id: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      rol: payload.rol,
    };
  }
}
