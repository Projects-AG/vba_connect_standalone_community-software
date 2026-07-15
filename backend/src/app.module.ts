import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './video/video.module';
import { NotificationModule } from './notifications/notification.module';
import { MeetingModule } from './meeting/meeting.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VideoModule,
    NotificationModule,
    MeetingModule
  ],
})
export class AppModule { }