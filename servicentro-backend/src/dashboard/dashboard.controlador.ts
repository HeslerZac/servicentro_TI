import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardServicio } from './dashboard.servicio';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('dashboard')
export class DashboardControlador {
  constructor(private readonly servicio: DashboardServicio) {}

  @Get('kpis')
  @ApiQuery({ name: 'stockMinimo', required: false, type: Number })
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  kpis(@Query('stockMinimo') stockMinimo?: string) {
    const umbral = stockMinimo !== undefined ? Number(stockMinimo) : undefined;
    return this.servicio.kpis(umbral);
  }

  @Get('ventas-ultimos-30-dias')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  ventasUltimos30Dias() {
    return this.servicio.ventasUltimos30Dias();
  }

  @Get('productos-mas-vendidos')
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'dias', required: false, type: Number })
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  productosMasVendidos(
    @Query('limite') limite?: string,
    @Query('dias') dias?: string,
  ) {
    return this.servicio.productosMasVendidos(
      Number(limite) || 10,
      Number(dias) || 30,
    );
  }
}
