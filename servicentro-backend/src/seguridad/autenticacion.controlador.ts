import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutenticacionServicio } from './autenticacion.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';

@ApiTags('auth')
@Controller('auth')
export class AutenticacionControlador {
  constructor(private readonly autenticacionServicio: AutenticacionServicio) {}

  @Post('login')
  iniciarSesion(@Body() dto: IniciarSesionDto) {
    return this.autenticacionServicio.iniciarSesion(dto);
  }
}
