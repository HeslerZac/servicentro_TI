import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1760594847567 implements MigrationInterface {
  name = 'Init1760594847567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vehiculos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "placa" character varying NOT NULL, "marca" character varying NOT NULL, "linea" character varying NOT NULL, "modelo" character varying, "color" character varying, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, "clienteId" uuid, CONSTRAINT "UQ_a9455f3a37d1d922a10f51664e9" UNIQUE ("placa"), CONSTRAINT "PK_bc0b75baae377e599cd46b502e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "nit" character varying NOT NULL DEFAULT 'CF', "direccion" character varying, "telefono" character varying, "correo" character varying, "estaActivo" boolean NOT NULL DEFAULT true, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd0720eef985c33a1a6f1d92aa" ON "clientes" ("nit") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fc3a69abcbaf61760658566d8e" ON "clientes" ("correo") WHERE "correo" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('ADMINISTRADOR', 'SECRETARIA', 'VENDEDOR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombreUsuario" character varying NOT NULL, "contrasenaHash" character varying NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL DEFAULT 'SECRETARIA', "estaActivo" boolean NOT NULL DEFAULT true, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b948c9bc89671151c8ab12d409" ON "usuarios" ("nombreUsuario") `,
    );
    await queryRunner.query(
      `CREATE TABLE "productos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying NOT NULL, "descripcion" character varying NOT NULL, "marca" character varying, "medida" character varying, "precioA" numeric(10,2) NOT NULL DEFAULT '0', "precioB" numeric(10,2) NOT NULL DEFAULT '0', "precioMayorista" numeric(10,2) NOT NULL DEFAULT '0', "estaActivo" boolean NOT NULL DEFAULT true, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "UQ_2da210b34325c2319d784a32d49" UNIQUE ("codigo"), CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "existencias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cantidad" numeric(12,3) NOT NULL DEFAULT '0', "cantidadReservada" numeric(12,3) NOT NULL DEFAULT '0', "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, "productoId" uuid, "bodegaId" uuid, CONSTRAINT "UQ_836d1886cd92c9ecfb15e7b96f7" UNIQUE ("productoId", "bodegaId"), CONSTRAINT "PK_fb68f342dbc431adccba3b6100a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9cc89abfe1c34b8014f62ef540" ON "existencias" ("productoId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc2e78c87b44d7ddaa86298eb5" ON "existencias" ("bodegaId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movimientos_inventario_tipo_enum" AS ENUM('ENTRADA', 'SALIDA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "movimientos_inventario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."movimientos_inventario_tipo_enum" NOT NULL, "cantidad" numeric(12,3) NOT NULL, "motivo" character varying, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "productoId" uuid, "bodegaId" uuid, CONSTRAINT "PK_812f6e4f95b017981363c4b9ff9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36a689b5824051c8a5308fcf08" ON "movimientos_inventario" ("productoId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c284c51bbef53e7397ac5c7f4d" ON "movimientos_inventario" ("bodegaId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bodegas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying NOT NULL, "nombre" character varying NOT NULL, "ubicacion" character varying, "estaActiva" boolean NOT NULL DEFAULT true, "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "PK_b28c5adff6f42b3ae75ff69b604" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_721cb08c3dc47c6f9fe497c9b0" ON "bodegas" ("codigo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ordenes_detalles_producto" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cantidad" numeric(12,3) NOT NULL, "costoUnitario" numeric(12,2) NOT NULL, "precioUnitario" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "desactivado_en" TIMESTAMP, "ordenId" uuid, "productoId" uuid, "bodegaId" uuid, CONSTRAINT "PK_5ab68bf6dd6848683f5e88050a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ordenes_detalles_servicio" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "descripcion" character varying NOT NULL, "costo" numeric(12,2) NOT NULL, "precio" numeric(12,2) NOT NULL, "desactivado_en" TIMESTAMP, "ordenId" uuid, CONSTRAINT "PK_a56a41e6b61a7aff890d8a1cecc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ordenes_servicio_estado_enum" AS ENUM('EN_CURSO', 'FINALIZADA', 'CANCELADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ordenes_servicio" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero" character varying NOT NULL, "estado" "public"."ordenes_servicio_estado_enum" NOT NULL DEFAULT 'EN_CURSO', "observaciones" character varying, "totalProductos" numeric(12,2) NOT NULL DEFAULT '0', "totalServicios" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL DEFAULT '0', "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "clienteId" uuid, "vehiculoId" uuid, "usuarioResponsableId" uuid, "ventaId" uuid, CONSTRAINT "UQ_503cd4bda73b0dae044de806348" UNIQUE ("numero"), CONSTRAINT "REL_d6a8d2d17424876722b7d384a3" UNIQUE ("ventaId"), CONSTRAINT "PK_949a2ee4e1ed008a7d89ef2a3c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ventas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero" character varying NOT NULL, "total" numeric(12,2) NOT NULL DEFAULT '0', "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "clienteId" uuid, "usuarioId" uuid NOT NULL, "ordenId" uuid, CONSTRAINT "UQ_b9d768d3a9c1c08bcd073ee16c9" UNIQUE ("numero"), CONSTRAINT "REL_0a1c3e2d6552db4e024484f0a7" UNIQUE ("ordenId"), CONSTRAINT "PK_b8b73abe8561829c019531d9a2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "detalles_venta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "descripcion" character varying, "cantidad" numeric(12,3) NOT NULL, "costoUnitario" numeric(12,2) NOT NULL DEFAULT '0', "precioUnitario" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "ventaId" uuid, "productoId" uuid, CONSTRAINT "PK_38c8bb56cd1fd62836f770fff4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, "estaActiva" boolean NOT NULL DEFAULT true, "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "UQ_ccdf6cd1a34ea90a7233325063d" UNIQUE ("nombre"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "marcas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, "estaActiva" boolean NOT NULL DEFAULT true, "creadaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivado_en" TIMESTAMP, CONSTRAINT "UQ_29f5713899c32a96a8900143c6f" UNIQUE ("nombre"), CONSTRAINT "PK_0dabf9ed9a15bfb634cb675f7d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categorias_marcas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "desactivado_en" TIMESTAMP, "categoriaId" uuid, "marcaId" uuid, CONSTRAINT "UQ_9861566381e27de87efeacf96ae" UNIQUE ("categoriaId", "marcaId"), CONSTRAINT "PK_45feee75ee7560f6a18e78c949d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cierres_ventas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "periodo" character varying NOT NULL, "fechaInicio" date NOT NULL, "fechaFin" date NOT NULL, "totalCosto" numeric(12,2) NOT NULL DEFAULT '0', "totalVenta" numeric(12,2) NOT NULL DEFAULT '0', "totalGanancia" numeric(12,2) NOT NULL DEFAULT '0', "detalle" jsonb, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bd39a908990ee96b04a97803590" UNIQUE ("periodo"), CONSTRAINT "PK_a238cf2f371d10c03c67587ed29" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facturas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero" character varying NOT NULL, "razonSocial" character varying NOT NULL, "nit" character varying NOT NULL, "direccion" character varying NOT NULL, "total" numeric(12,2) NOT NULL, "datosNegocio" jsonb, "datosVehiculo" jsonb, "emitidaEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadaEn" TIMESTAMP NOT NULL DEFAULT now(), "ventaId" uuid, "clienteId" uuid, CONSTRAINT "UQ_e96e0896b0f2a4319d61fcf9ff7" UNIQUE ("numero"), CONSTRAINT "REL_8416d51118716fd00fc777c7b0" UNIQUE ("ventaId"), CONSTRAINT "PK_f302947c1e4773639b20707a8bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehiculos" ADD CONSTRAINT "FK_1c06553ebb5b8d903cd307816ea" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "existencias" ADD CONSTRAINT "FK_9cc89abfe1c34b8014f62ef540d" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "existencias" ADD CONSTRAINT "FK_bc2e78c87b44d7ddaa86298eb54" FOREIGN KEY ("bodegaId") REFERENCES "bodegas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "FK_36a689b5824051c8a5308fcf08c" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "FK_c284c51bbef53e7397ac5c7f4d8" FOREIGN KEY ("bodegaId") REFERENCES "bodegas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" ADD CONSTRAINT "FK_3f8ac653bbea16baf3287708881" FOREIGN KEY ("ordenId") REFERENCES "ordenes_servicio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" ADD CONSTRAINT "FK_d724d47f941eea4eaae8a3fecd5" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" ADD CONSTRAINT "FK_fed57c89e4b85f0ccde58366c87" FOREIGN KEY ("bodegaId") REFERENCES "bodegas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_servicio" ADD CONSTRAINT "FK_f7e55062f33182a6ee2677f606a" FOREIGN KEY ("ordenId") REFERENCES "ordenes_servicio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "FK_715fb95c180484bbb88c45df257" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "FK_7fbe9e7b7a13da2a3fe975dc531" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "FK_5b64ec877dab2b14ec8a53d143f" FOREIGN KEY ("usuarioResponsableId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "FK_d6a8d2d17424876722b7d384a38" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD CONSTRAINT "FK_771620ab33741414f8248217fc3" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD CONSTRAINT "FK_ffe890346eb72924c06ff4df0a7" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD CONSTRAINT "FK_0a1c3e2d6552db4e024484f0a77" FOREIGN KEY ("ordenId") REFERENCES "ordenes_servicio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "detalles_venta" ADD CONSTRAINT "FK_df7398529afa3bc1038e1e65ef2" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "detalles_venta" ADD CONSTRAINT "FK_68ef2c579f0ac8f119628ec452d" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorias_marcas" ADD CONSTRAINT "FK_e10c471624b95cabfb233e9b189" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorias_marcas" ADD CONSTRAINT "FK_c5cf4ad3b6bf5903f54d73dbcee" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facturas" ADD CONSTRAINT "FK_8416d51118716fd00fc777c7b03" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facturas" ADD CONSTRAINT "FK_be6dba2298d9414913463f492bb" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facturas" DROP CONSTRAINT "FK_be6dba2298d9414913463f492bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facturas" DROP CONSTRAINT "FK_8416d51118716fd00fc777c7b03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorias_marcas" DROP CONSTRAINT "FK_c5cf4ad3b6bf5903f54d73dbcee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorias_marcas" DROP CONSTRAINT "FK_e10c471624b95cabfb233e9b189"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detalles_venta" DROP CONSTRAINT "FK_68ef2c579f0ac8f119628ec452d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detalles_venta" DROP CONSTRAINT "FK_df7398529afa3bc1038e1e65ef2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT "FK_0a1c3e2d6552db4e024484f0a77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT "FK_ffe890346eb72924c06ff4df0a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT "FK_771620ab33741414f8248217fc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" DROP CONSTRAINT "FK_d6a8d2d17424876722b7d384a38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" DROP CONSTRAINT "FK_5b64ec877dab2b14ec8a53d143f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" DROP CONSTRAINT "FK_7fbe9e7b7a13da2a3fe975dc531"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_servicio" DROP CONSTRAINT "FK_715fb95c180484bbb88c45df257"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_servicio" DROP CONSTRAINT "FK_f7e55062f33182a6ee2677f606a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" DROP CONSTRAINT "FK_fed57c89e4b85f0ccde58366c87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" DROP CONSTRAINT "FK_d724d47f941eea4eaae8a3fecd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordenes_detalles_producto" DROP CONSTRAINT "FK_3f8ac653bbea16baf3287708881"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "FK_c284c51bbef53e7397ac5c7f4d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "FK_36a689b5824051c8a5308fcf08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "existencias" DROP CONSTRAINT "FK_bc2e78c87b44d7ddaa86298eb54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "existencias" DROP CONSTRAINT "FK_9cc89abfe1c34b8014f62ef540d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehiculos" DROP CONSTRAINT "FK_1c06553ebb5b8d903cd307816ea"`,
    );
    await queryRunner.query(`DROP TABLE "facturas"`);
    await queryRunner.query(`DROP TABLE "cierres_ventas"`);
    await queryRunner.query(`DROP TABLE "categorias_marcas"`);
    await queryRunner.query(`DROP TABLE "marcas"`);
    await queryRunner.query(`DROP TABLE "categorias"`);
    await queryRunner.query(`DROP TABLE "detalles_venta"`);
    await queryRunner.query(`DROP TABLE "ventas"`);
    await queryRunner.query(`DROP TABLE "ordenes_servicio"`);
    await queryRunner.query(
      `DROP TYPE "public"."ordenes_servicio_estado_enum"`,
    );
    await queryRunner.query(`DROP TABLE "ordenes_detalles_servicio"`);
    await queryRunner.query(`DROP TABLE "ordenes_detalles_producto"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_721cb08c3dc47c6f9fe497c9b0"`,
    );
    await queryRunner.query(`DROP TABLE "bodegas"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c284c51bbef53e7397ac5c7f4d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36a689b5824051c8a5308fcf08"`,
    );
    await queryRunner.query(`DROP TABLE "movimientos_inventario"`);
    await queryRunner.query(
      `DROP TYPE "public"."movimientos_inventario_tipo_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc2e78c87b44d7ddaa86298eb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9cc89abfe1c34b8014f62ef540"`,
    );
    await queryRunner.query(`DROP TABLE "existencias"`);
    await queryRunner.query(`DROP TABLE "productos"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b948c9bc89671151c8ab12d409"`,
    );
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc3a69abcbaf61760658566d8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd0720eef985c33a1a6f1d92aa"`,
    );
    await queryRunner.query(`DROP TABLE "clientes"`);
    await queryRunner.query(`DROP TABLE "vehiculos"`);
  }
}
