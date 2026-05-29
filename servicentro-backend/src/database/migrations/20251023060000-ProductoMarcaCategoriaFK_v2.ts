import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ajusta la entidad Producto para usar relaciones a Marca/Categoría
 * - Quita columna antigua "marca" (varchar)
 * - Agrega columnas FK: "marcaId" y "categoriaId"
 * - Crea llaves foráneas a tablas "marcas" y "categorias"
 */
export class ProductoMarcaCategoriaFKV220251023060000
  implements MigrationInterface
{
  name = 'ProductoMarcaCategoriaFKV220251023060000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Quitar columna simple "marca" si existe
    await queryRunner.query(
      'ALTER TABLE "productos" DROP COLUMN IF EXISTS "marca"',
    );

    // 2) Agregar columnas FK si no existen (uuid, nullable)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='productos' AND column_name='marcaId'
        ) THEN
          ALTER TABLE "productos" ADD COLUMN "marcaId" uuid NULL;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='productos' AND column_name='categoriaId'
        ) THEN
          ALTER TABLE "productos" ADD COLUMN "categoriaId" uuid NULL;
        END IF;
      END$$;
    `);

    // 3) Crear FKs si no existen
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_productos_marca'
        ) THEN
          ALTER TABLE "productos"
          ADD CONSTRAINT "FK_productos_marca" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_productos_categoria'
        ) THEN
          ALTER TABLE "productos"
          ADD CONSTRAINT "FK_productos_categoria" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END$$;
    `);

    // 4) (Opcional) índices para mejorar búsqueda por FK
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_productos_marcaId" ON "productos"("marcaId")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_productos_categoriaId" ON "productos"("categoriaId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir FKs e índices
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_productos_categoriaId"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_productos_marcaId"');
    await queryRunner.query(
      'ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "FK_productos_categoria"',
    );
    await queryRunner.query(
      'ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "FK_productos_marca"',
    );

    // Quitar columnas FK
    await queryRunner.query(
      'ALTER TABLE "productos" DROP COLUMN IF EXISTS "categoriaId"',
    );
    await queryRunner.query(
      'ALTER TABLE "productos" DROP COLUMN IF EXISTS "marcaId"',
    );

    // Restaurar columna simple "marca" para dejar el esquema como antes
    await queryRunner.query(
      'ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "marca" varchar NULL',
    );
  }
}
