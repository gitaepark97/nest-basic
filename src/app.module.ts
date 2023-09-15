import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { PostsModule } from './posts/posts.module';
import { CustomConfigModule } from './custom-config/custom-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const secrets = configService.get('database');
        return {
          type: secrets.type,
          host: secrets.host,
          username: secrets.username,
          password: secrets.password,
          database: secrets.database,
          entities: ['dist/entities/*.js'],
          migrations: ['dist/db/migrations/*.js'],
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ChatRoomsModule,
    PostsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
