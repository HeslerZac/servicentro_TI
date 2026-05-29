import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * name_FixMissingEntities_v2
 * Asegura columnas/tablas requeridas por entidades actuales sin romper entornos existentes.
 */
export class FixMissingEntitiesV220251023052000 implements MigrationInterface {
  name = 'FixMissingEntitiesV220251023052000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Venta.anulada_en (solo si no existe)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'ventas'
            AND column_name = 'anulada_en'
        ) THEN
          ALTER TABLE "ventas" ADD COLUMN "anulada_en" TIMESTAMP;
        END IF;
      END$$;
    `);

    // 2) Tabla proveedores (solo si no existe)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "proveedores" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nombre" varchar NOT NULL UNIQUE,
        "nit" varchar NULL,
        "telefono" varchar NULL,
        "direccion" varchar NULL,
        "creadoEn" timestamp NOT NULL DEFAULT now(),
        "actualizadoEn" timestamp NOT NULL DEFAULT now(),
        "desactivadoEn" timestamp NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir con prudencia
    await queryRunner.query(
      'ALTER TABLE "ventas" DROP COLUMN IF EXISTS "anulada_en"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "proveedores"');
  }
}
