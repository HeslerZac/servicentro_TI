import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ComprasServicio } from './compras.servicio';
import { CrearCompraDto } from './dto/crear-compra.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('compras')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('compras')
export class ComprasControlador {
  constructor(private readonly servicio: ComprasServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  crear(@Body() dto: CrearCompraDto) {
    return this.servicio.crear(dto);
  }
}
