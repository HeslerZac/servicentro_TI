import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CierresServicio } from './cierres.servicio';
import { GenerarCierreDto } from './dto/generar-cierre.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('cierres')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('cierres')
export class CierresControlador {
  constructor(private readonly servicio: CierresServicio) {}

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  listar() {
    return this.servicio.listar();
  }

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  generar(@Body() dto: GenerarCierreDto) {
    return this.servicio.generar(dto);
  }
}
