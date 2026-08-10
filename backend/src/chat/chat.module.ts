import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/entities/user.entity';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatController } from './controller/chat.controller';
import { ChatService } from './service/chat.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ConversationEntity,
      MessageEntity,
      UserEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
