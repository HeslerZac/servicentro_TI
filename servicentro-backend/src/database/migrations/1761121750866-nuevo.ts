import { MigrationInterface, QueryRunner } from 'typeorm';

export class Nuevo1761121750866 implements MigrationInterface {
  name = 'Nuevo1761121750866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "cajas_sesion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "estado" character varying NOT NULL DEFAULT 'ABIERTA', "fechaapertura" TIMESTAMP NOT NULL DEFAULT now(), "fechacierre" TIMESTAMP, "saldoinicialefectivo" numeric(12,2) NOT NULL, "saldoteoricoefectivo" numeric(12,2) NOT NULL DEFAULT '0', "saldorealefectivo" numeric(12,2), "diferencia" numeric(12,2), "totalefectivo" numeric(12,2) NOT NULL DEFAULT '0', "totaltarjeta" numeric(12,2) NOT NULL DEFAULT '0', "totaltransfer" numeric(12,2) NOT NULL DEFAULT '0', "creadoen" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoen" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f95ed30a93d75929563ca6df45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "proveedores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "nit" character varying, "telefono" character varying, "direccion" character varying, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP NOT NULL DEFAULT now(), "desactivadoEn" TIMESTAMP, CONSTRAINT "UQ_2e65e98d5d91c6cab3abdcf7c27" UNIQUE ("nombre"), CONSTRAINT "PK_1dcf121f19f362fb1b4c0a493a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "compras_detalles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cantidad" numeric(12,3) NOT NULL, "costoUnitario" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "compraId" uuid, "productoId" uuid, "bodegaId" uuid, CONSTRAINT "PK_d1cbf3682ba4ee21a820e7f3d03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "compras" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "total" numeric(12,2) NOT NULL, "creadoEn" TIMESTAMP NOT NULL DEFAULT now(), "proveedorId" uuid, CONSTRAINT "PK_63037d5249eefe140e3587ff6f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "clientes" DROP COLUMN IF EXISTS "estaActivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "estaActivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bodegas" DROP COLUMN IF EXISTS "estaActiva"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "estaActivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "formaPago"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "nombre" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "telefono" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "direccion" character varying`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ventas_estado_enum') THEN CREATE TYPE "public"."ventas_estado_enum" AS ENUM('ABIERTA', 'PAGADA', 'ANULADA'); END IF; END$$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "estado" "public"."ventas_estado_enum" NOT NULL DEFAULT 'ABIERTA'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "subtotal" numeric(12,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "descuento" numeric(12,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "impuestos" numeric(12,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "formapago" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "anulada_en" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "cajasesionid" uuid`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_78895ba9cac7d6952987e80ed75') THEN ALTER TABLE "ventas" ADD CONSTRAINT "FK_78895ba9cac7d6952987e80ed75" FOREIGN KEY ("cajasesionid") REFERENCES "cajas_sesion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; END IF; END$$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_30abc4cd3cc8a4924e79226529d') THEN ALTER TABLE "compras_detalles" ADD CONSTRAINT "FK_30abc4cd3cc8a4924e79226529d" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END$$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_3c43196c87ab1d2e9796eeb8e38') THEN ALTER TABLE "compras_detalles" ADD CONSTRAINT "FK_3c43196c87ab1d2e9796eeb8e38" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; END IF; END$$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_354f0a5c4b4ba3e0c12c372b952') THEN ALTER TABLE "compras_detalles" ADD CONSTRAINT "FK_354f0a5c4b4ba3e0c12c372b952" FOREIGN KEY ("bodegaId") REFERENCES "bodegas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; END IF; END$$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ccbc87d4d0703f780e5f55f1f04') THEN ALTER TABLE "compras" ADD CONSTRAINT "FK_ccbc87d4d0703f780e5f55f1f04" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; END IF; END$$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "compras" DROP CONSTRAINT "FK_ccbc87d4d0703f780e5f55f1f04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "compras_detalles" DROP CONSTRAINT "FK_354f0a5c4b4ba3e0c12c372b952"`,
    );
    await queryRunner.query(
      `ALTER TABLE "compras_detalles" DROP CONSTRAINT "FK_3c43196c87ab1d2e9796eeb8e38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "compras_detalles" DROP CONSTRAINT "FK_30abc4cd3cc8a4924e79226529d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT IF EXISTS "FK_78895ba9cac7d6952987e80ed75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "cajasesionid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "anulada_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "formapago"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "impuestos"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "descuento"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "subtotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "estado"`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ventas_estado_enum') THEN DROP TYPE "public"."ventas_estado_enum"; END IF; END$$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "direccion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "telefono"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "nombre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "formaPago" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "estaActivo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "bodegas" ADD COLUMN IF NOT EXISTS "estaActiva" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "estaActivo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "estaActivo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "compras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "compras_detalles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "proveedores"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cajas_sesion"`);
  }
}
