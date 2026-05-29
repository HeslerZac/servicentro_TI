import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostoEnProducto1760671300402 implements MigrationInterface {
  name = 'AddCostoEnProducto1760671300402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "costo" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "costo"`);
  }
}
