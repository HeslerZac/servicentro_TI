import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventariosServicio } from './inventarios.servicio';
import { CrearExistenciaDto } from './dto/crear-existencia.dto';
import { ActualizarExistenciaDto } from './dto/actualizar-existencia.dto';
import { AjustarInventarioDto } from './dto/ajustar-inventario.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('inventarios')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('inventarios')
export class InventariosControlador {
  constructor(private readonly servicio: InventariosServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  crear(@Body() dto: CrearExistenciaDto) {
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
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarExistenciaDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }

  @Post('movimientos')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  ajustar(@Body() dto: AjustarInventarioDto) {
    return this.servicio.ajustar(dto);
  }

  @Get('movimientos/listado')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  listarMovimientos(
    @Query('productoId') productoId?: string,
    @Query('bodegaId') bodegaId?: string,
  ) {
    return this.servicio.listarMovimientos(productoId, bodegaId);
  }
}
