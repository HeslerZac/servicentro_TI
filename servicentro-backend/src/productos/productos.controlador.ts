import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductosServicio } from './productos.servicio';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';
import { BuscarProductosDto } from './dto/buscar-productos.dto';

@ApiTags('productos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller(['productos', 'products'])
export class ProductosControlador {
  constructor(private readonly servicio: ProductosServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.SECRETARIA)
  crear(@Body() dto: CrearProductoDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.SECRETARIA)
  listar(@Query() dto: BuscarProductosDto) {
    return this.servicio.listar(dto);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.SECRETARIA)
  buscarPorId(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProductoDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
