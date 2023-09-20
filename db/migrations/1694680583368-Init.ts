import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1694680583368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`users\` (
        \`user_id\` int PRIMARY KEY AUTO_INCREMENT,
        \`email\` varchar(50) UNIQUE NOT NULL,
        \`hashed_password\` varchar(255) NOT NULL,
        \`salt\` varchar(255) NOT NULL,
        \`nickname\` varchar(50) UNIQUE NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now())
          );`);
    await queryRunner.query(`CREATE TABLE \`sessions\` (
        \`session_id\` char(36) PRIMARY KEY,
        \`user_id\` int NOT NULL,
        \`refresh_token\` varchar(255) NOT NULL,
        \`user_agent\` varchar(255) NOT NULL,
        \`client_ip\` varchar(255) NOT NULL,
        \`is_blocked\` boolean NOT NULL DEFAULT (false),
        \`created_at\` timestamp NOT NULL DEFAULT (now())
      );`);
    await queryRunner.query(`CREATE TABLE \`categories\` (
        \`category_id\` int PRIMARY KEY AUTO_INCREMENT,
        \`title\` varchar(50) UNIQUE NOT NULL,
        \`parent_category_id\` int DEFAULT (null),
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now())
      );`);
    await queryRunner.query(`CREATE TABLE \`posts\` (
        \`post_id\` int PRIMARY KEY AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`category_id\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`thumbnail_image_url\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now()),
        \`deleted_at\` timestamp DEFAULT NULL
      );`);
    await queryRunner.query(`CREATE TABLE \`chat_rooms\` (
        \`chat_room_id\` int PRIMARY KEY AUTO_INCREMENT,
        \`title\` varchar(50) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now())
      );`);
    await queryRunner.query(`CREATE TABLE \`chat_room_users\` (
        \`chat_room_id\` int,
        \`user_id\` int,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        PRIMARY KEY (\`chat_room_id\`, \`user_id\`)
      );`);
    await queryRunner.query(`CREATE TABLE \`chats\` (
        \`chat_id\` int PRIMARY KEY AUTO_INCREMENT,
        \`chat_room_id\` int NOT NULL,
        \`user_id\` int,
        \`content\` text NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now())
      );`);
    await queryRunner.query(`CREATE INDEX \`title\` ON \`posts\` (\`title\`);`);
    await queryRunner.query(
      `ALTER TABLE \`sessions\` ADD FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`category_id\`) ON DELETE RESTRICT;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room_users\` ADD FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room_users\` ADD FOREIGN KEY (\`chat_room_id\`) REFERENCES \`chat_rooms\` (\`chat_room_id\`) ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD FOREIGN KEY (\`chat_room_id\`) REFERENCES \`chat_rooms\` (\`chat_room_id\`) ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`chats\`;`);
    await queryRunner.query(`DROP TABLE \`chat_room_users\`;`);
    await queryRunner.query(`DROP TABLE \`chat_rooms\`;`);
    await queryRunner.query(`DROP TABLE \`posts\`;`);
    await queryRunner.query(`DROP TABLE \`categories\`;`);
    await queryRunner.query(`DROP TABLE \`sessions\`;`);
    await queryRunner.query(`DROP TABLE \`users\`;`);
  }
}
