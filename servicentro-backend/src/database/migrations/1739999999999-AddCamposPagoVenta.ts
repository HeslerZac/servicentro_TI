import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCamposPagoVenta1739999999999 implements MigrationInterface {
  name = 'AddCamposPagoVenta1739999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "formaPago" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "recibido" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "cambio" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "cambio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "recibido"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ventas" DROP COLUMN IF EXISTS "formaPago"`,
    );
  }
}
