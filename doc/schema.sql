-- SQL dump generated using DBML (dbml-lang.org)
-- Database: PostgreSQL
-- Generated at: 2023-09-19T08:56:11.413Z

CREATE TABLE "users" (
  "user_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "email" varchar(50) UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "salt" varchar NOT NULL,
  "nickname" varchar(50) UNIQUE NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "sessions" (
  "session_id" char(36) PRIMARY KEY,
  "user_id" int NOT NULL,
  "refresh_token" varchar NOT NULL,
  "user_agent" varchar NOT NULL,
  "client_ip" varchar NOT NULL,
  "is_blocked" boolean NOT NULL DEFAULT (false),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "categories" (
  "category_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" varchar(50) UNIQUE NOT NULL,
  "parent_category_id" int DEFAULT (null),
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "posts" (
  "post_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "user_id" int NOT NULL,
  "category_id" int NOT NULL,
  "title" varchar NOT NULL,
  "thumbnail_image_url" varchar NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp DEFAULT (null)
);

CREATE TABLE "chat_rooms" (
  "chat_room_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" varchar(50) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "chat_room_users" (
  "chat_room_id" int,
  "user_id" int,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY ("chat_room_id", "user_id")
);

CREATE TABLE "chats" (
  "chat_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "chat_room_id" int NOT NULL,
  "user_id" int,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE INDEX "title" ON "posts" ("title");

ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

ALTER TABLE "posts" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("category_id") ON DELETE RESTRICT;

ALTER TABLE "chat_room_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

ALTER TABLE "chat_room_users" ADD FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms" ("chat_room_id") ON DELETE CASCADE;

ALTER TABLE "chats" ADD FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms" ("chat_room_id") ON DELETE CASCADE;

ALTER TABLE "chats" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL;
