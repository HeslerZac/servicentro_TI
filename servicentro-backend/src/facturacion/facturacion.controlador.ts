import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FacturacionServicio } from './facturacion.servicio';
import { EmitirFacturaDto } from './dto/emitir-factura.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('facturacion')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('facturacion')
export class FacturacionControlador {
  constructor(private readonly servicio: FacturacionServicio) {}

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  listar() {
    return this.servicio.listar();
  }

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  emitir(@Body() dto: EmitirFacturaDto) {
    return this.servicio.emitir(dto);
  }
}
