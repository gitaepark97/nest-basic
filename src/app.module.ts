import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { PostsModule } from './posts/posts.module';
import { CustomConfigModule } from './custom-config/custom-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Users } from './entities/Users';
import { Sessions } from './entities/Sessions';
import { Posts } from './entities/Posts';
import { Categories } from './entities/Categories';
import { ChatRooms } from './entities/ChatRooms';
import { ChatRoomUsers } from './entities/ChatRoomUsers';
import { Chats } from './entities/Chats';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';

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
          entities: [
            Users,
            Sessions,
            Categories,
            Posts,
            ChatRooms,
            ChatRoomUsers,
            Chats,
          ],
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ChatRoomsModule,
    PostsModule,
    AuthModule,
    CategoriesModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
