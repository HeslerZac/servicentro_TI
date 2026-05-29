import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnuladaEnIfMissing20251023001200 implements MigrationInterface {
  name = 'AddAnuladaEnIfMissing20251023001200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'ventas' AND column_name = 'anulada_en'
        ) THEN
          ALTER TABLE "ventas" ADD COLUMN "anulada_en" TIMESTAMP;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "ventas" DROP COLUMN IF EXISTS "anulada_en"',
    );
  }
}
