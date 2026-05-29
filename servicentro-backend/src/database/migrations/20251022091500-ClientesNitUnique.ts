import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClientesNitUnique20251022091500 implements MigrationInterface {
  name = 'ClientesNitUnique20251022091500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índice único parcial para NIT distinto de 'CF' y no nulo, solo en registros activos
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UQ_clientes_nit_activo'
        ) THEN
          CREATE UNIQUE INDEX "UQ_clientes_nit_activo" ON "clientes" ("nit")
          WHERE nit IS NOT NULL AND upper(nit) <> 'CF' AND "desactivado_en" IS NULL;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_clientes_nit_activo"');
  }
}
