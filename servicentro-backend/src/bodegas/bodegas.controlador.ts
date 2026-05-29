import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BodegasServicio } from './bodegas.servicio';
import { CrearBodegaDto } from './dto/crear-bodega.dto';
import { ActualizarBodegaDto } from './dto/actualizar-bodega.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('bodegas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('bodegas')
export class BodegasControlador {
  constructor(private readonly servicio: BodegasServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  crear(@Body() dto: CrearBodegaDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  listar() {
    return this.servicio.listar();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  buscarPorId(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarBodegaDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
