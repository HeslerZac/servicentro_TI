import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaludModulo } from './salud/salud.modulo';
import { ProductosModulo } from './productos/productos.modulo';
import { ClientesModulo } from './clientes/clientes.modulo';
import { BodegasModulo } from './bodegas/bodegas.modulo';
import { InventariosModulo } from './inventarios/inventarios.modulo';
import { UsuariosModulo } from './usuarios/usuarios.modulo';
import { VentasModulo } from './ventas/ventas.modulo';
import { SeguridadModulo } from './seguridad/seguridad.modulo';
import { CatalogosModulo } from './catalogos/catalogos.modulo';
import { VehiculosModulo } from './vehiculos/vehiculos.modulo';
import { OrdenesModulo } from './ordenes/ordenes.modulo';
import { FacturacionModulo } from './facturacion/facturacion.modulo';
import { CierresModulo } from './cierres/cierres.modulo';
import { DashboardModulo } from './dashboard/dashboard.modulo';
import { CajaModulo } from './caja/caja.modulo';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT || 5432),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        // SOLO para avanzar en desarrollo inicial. Luego lo pondremos en false y usaremos migraciones.
        synchronize: process.env.TYPEORM_SYNC === 'true',
        logging:
          process.env.TYPEORM_LOGGING === 'true' ||
          process.env.NODE_ENV !== 'production',
      }),
    }),
    SaludModulo,
    SeguridadModulo,
    ProductosModulo,
    ClientesModulo,
    BodegasModulo,
    InventariosModulo,
    UsuariosModulo,
    VentasModulo,
    CatalogosModulo,
    VehiculosModulo,
    OrdenesModulo,
    FacturacionModulo,
    CierresModulo,
    DashboardModulo,
    CajaModulo,
    ProveedoresModule,
    ComprasModule,
  ],
})
export class AplicacionModulo {}
