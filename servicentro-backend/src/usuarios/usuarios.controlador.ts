import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuariosServicio } from './usuarios.servicio';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { ActualizarContrasenaDto } from './dto/actualizar-contrasena.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario, Usuario } from './usuario.entidad';
import { UsuarioActual } from '../seguridad/usuario-actual.decorador';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';

@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosControlador {
  constructor(private readonly servicio: UsuariosServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  crear(@Body() dto: CrearUsuarioDto) {
    return this.servicio.crearUsuario(dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR)
  listar(@Query('includeInactive') includeInactive?: string) {
    const inc = String(includeInactive).toLowerCase() === 'true';
    return inc ? this.servicio.listarConInactivos() : this.servicio.listar();
  }

  @Patch('password')
  @UseGuards(JwtAutenticacionGuard)
  cambiarPassword(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.servicio.cambiarPassword(
      usuario.id,
      dto.passwordActual,
      dto.nuevaPassword,
    );
  }

  @Patch(':id/rol')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizarRol(@Param('id') id: string, @Body() dto: ActualizarRolDto) {
    return this.servicio.actualizarRol(id, dto.rol);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizarPerfil(@Param('id') id: string, @Body() dto: ActualizarPerfilDto) {
    return this.servicio.actualizarPerfil(id, dto);
  }

  @Patch(':id/estado')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoDto) {
    return this.servicio.actualizarEstado(id, dto.estaActivo);
  }

  @Patch(':id/contrasena')
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizarContrasena(
    @Param('id') id: string,
    @Body() dto: ActualizarContrasenaDto,
  ) {
    return this.servicio.actualizarContrasena(id, dto.contrasena);
  }
}
