import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteUniqueness1761114469145 implements MigrationInterface {
  name = 'SoftDeleteUniqueness1761114469145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotente: si la tabla ya existe (por otra migración), no falla
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "cajas_sesion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "estado" character varying NOT NULL DEFAULT 'ABIERTA', "fechaapertura" TIMESTAMP NOT NULL DEFAULT now(), "fechacierre" TIMESTAMP, "saldoinicialefectivo" numeric(12,2) NOT NULL, "saldoteoricoefectivo" numeric(12,2) NOT NULL DEFAULT '0', "saldorealefectivo" numeric(12,2), "diferencia" numeric(12,2), "totalefectivo" numeric(12,2) NOT NULL DEFAULT '0', "totaltarjeta" numeric(12,2) NOT NULL DEFAULT '0', "totaltransfer" numeric(12,2) NOT NULL DEFAULT '0', "creadoen" TIMESTAMP NOT NULL DEFAULT now(), "actualizadoen" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f95ed30a93d75929563ca6df45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "clientes" DROP COLUMN IF EXISTS "estaActivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "estaActivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bodegas" DROP COLUMN IF EXISTS "estaActiva"`,
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
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "formapago" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "cajasesionid" uuid`,
    );
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_78895ba9cac7d6952987e80ed75'
      ) THEN
        ALTER TABLE "ventas" ADD CONSTRAINT "FK_78895ba9cac7d6952987e80ed75" FOREIGN KEY ("cajasesionid") REFERENCES "cajas_sesion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT IF EXISTS "FK_78895ba9cac7d6952987e80ed75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "cajasesionid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "formapago"`,
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
      `ALTER TABLE "bodegas" ADD COLUMN IF NOT EXISTS "estaActiva" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "estaActivo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "estaActivo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "cajas_sesion"`);
  }
}
