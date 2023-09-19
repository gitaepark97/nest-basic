import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryData1695109826592 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO \`categories\`(
                title
            ) VALUES (
                "카테고리1"
            ), (
                "카테고리2"
            ), (
                "카테고리3"
            ), (
                "카테고리4"
            ), (
                "카테고리5"
            ), (
                "카테고리6"
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM \`categories\`;
    `);
  }
}
