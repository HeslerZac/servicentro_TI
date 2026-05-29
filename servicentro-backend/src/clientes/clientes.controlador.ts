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
import { ClientesServicio } from './clientes.servicio';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('clientes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('clientes')
export class ClientesControlador {
  constructor(private readonly servicio: ClientesServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  crear(@Body() dto: CrearClienteDto) {
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
  actualizar(@Param('id') id: string, @Body() dto: ActualizarClienteDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
