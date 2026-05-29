import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CatalogosServicio } from './catalogos.servicio';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearMarcaDto } from './dto/crear-marca.dto';
import { ActualizarMarcaDto } from './dto/actualizar-marca.dto';
import { AsignarMarcaDto } from './dto/asignar-marca.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('catalogos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('catalogos')
export class CatalogosControlador {
  constructor(private readonly servicio: CatalogosServicio) {}

  @Post('categorias')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  crearCategoria(@Body() dto: CrearCategoriaDto) {
    return this.servicio.crearCategoria(dto);
  }

  @Get('categorias')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  listarCategorias(@Query('incluirInactivas') incluirInactivas?: string) {
    return this.servicio.listarCategorias(incluirInactivas === 'true');
  }

  @Patch('categorias/:id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  actualizarCategoria(
    @Param('id') id: string,
    @Body() dto: ActualizarCategoriaDto,
  ) {
    return this.servicio.actualizarCategoria(id, dto);
  }

  @Post('marcas')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  crearMarca(@Body() dto: CrearMarcaDto) {
    return this.servicio.crearMarca(dto);
  }

  @Get('marcas')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  listarMarcas(@Query('incluirInactivas') incluirInactivas?: string) {
    return this.servicio.listarMarcas(incluirInactivas === 'true');
  }

  @Patch('marcas/:id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  actualizarMarca(@Param('id') id: string, @Body() dto: ActualizarMarcaDto) {
    return this.servicio.actualizarMarca(id, dto);
  }

  @Get('categorias/:id/marcas')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  listarMarcasCategoria(@Param('id') id: string) {
    return this.servicio.listarMarcasPorCategoria(id);
  }

  @Post('categorias/:id/marcas')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  asignarMarca(@Param('id') categoriaId: string, @Body() dto: AsignarMarcaDto) {
    return this.servicio.asignarMarcaACategoria(categoriaId, dto.marcaId);
  }

  @Delete('categorias/:id/marcas/:marcaId')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  removerMarca(
    @Param('id') categoriaId: string,
    @Param('marcaId') marcaId: string,
  ) {
    return this.servicio.removerMarcaDeCategoria(categoriaId, marcaId);
  }
}
