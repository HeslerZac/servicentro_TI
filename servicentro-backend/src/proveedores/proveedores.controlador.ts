import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProveedoresServicio } from './proveedores.servicio';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('proveedores')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresControlador {
  constructor(private readonly servicio: ProveedoresServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  crear(@Body() dto: CrearProveedorDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  listar() {
    return this.servicio.listar();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  buscarPorId(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Put(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProveedorDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
