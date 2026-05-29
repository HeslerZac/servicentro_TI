import { MigrationInterface, QueryRunner } from 'typeorm';

export class CajaInit20251021000833 implements MigrationInterface {
  name = 'CajaInit20251021000833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "cajas_sesion" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "estado" varchar NOT NULL DEFAULT 'ABIERTA',
      "fechaApertura" timestamp NOT NULL DEFAULT now(),
      "fechaCierre" timestamp NULL,
      "saldoInicialEfectivo" numeric(12,2) NOT NULL,
      "saldoTeoricoEfectivo" numeric(12,2) NOT NULL DEFAULT 0,
      "saldoRealEfectivo" numeric(12,2) NULL,
      "diferencia" numeric(12,2) NULL,
      "totalEfectivo" numeric(12,2) NOT NULL DEFAULT 0,
      "totalTarjeta" numeric(12,2) NOT NULL DEFAULT 0,
      "totalTransfer" numeric(12,2) NOT NULL DEFAULT 0,
      "creadoEn" timestamp NOT NULL DEFAULT now(),
      "actualizadoEn" timestamp NOT NULL DEFAULT now()
    );`);

    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "cajaSesionId" uuid`,
    );
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_venta_caja'
      ) THEN
        ALTER TABLE "ventas" ADD CONSTRAINT fk_venta_caja FOREIGN KEY ("cajaSesionId") REFERENCES "cajas_sesion"(id);
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP CONSTRAINT IF EXISTS fk_venta_caja`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "cajaSesionId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "cajas_sesion"`);
  }
}
