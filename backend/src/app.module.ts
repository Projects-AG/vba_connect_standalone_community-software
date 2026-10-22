import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoModule } from './video/video.module';
import { NotificationModule } from './notifications/notification.module';
import { MeetingModule } from './meeting/meeting.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CallsModule } from './calls/calls.module';
import { UserEntity } from './auth/entities/user.entity';
import { MeetingEntity } from './meeting/entities/meeting.entity';
import { MeetingRecordingEntity } from './meeting/entities/meeting-recording.entity';
import { TranscriptSegmentEntity } from './meeting/entities/transcript-segment.entity';
import { ActionItemEntity } from './meeting/entities/action-item.entity';
import { DecisionEntity } from './meeting/entities/decision.entity';
import { ConversationEntity } from './chat/entities/conversation.entity';
import { MessageEntity } from './chat/entities/message.entity';
import { CallLogEntity } from './calls/entities/call-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST') || 'localhost',
        port: Number(config.get<string>('DB_PORT') || 3306),
        username: config.get<string>('DB_USER') || 'root',
        password: config.get<string>('DB_PASSWORD') || '',
        database: config.get<string>('DB_NAME') || 'loop_db',
        entities: [
          UserEntity,
          MeetingEntity,
          MeetingRecordingEntity,
          TranscriptSegmentEntity,
          ActionItemEntity,
          DecisionEntity,
          ConversationEntity,
          MessageEntity,
          CallLogEntity,
        ],
        synchronize: config.get<string>('DB_SYNC') !== 'false',
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    VideoModule,
    NotificationModule,
    MeetingModule,
    ChatModule,
    CallsModule,
  ],
})
export class AppModule {}
