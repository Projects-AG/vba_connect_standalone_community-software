import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeetingController } from './controller/meeting.controller';
import { MeetingService } from './service/meeting.service';
import { MeetingModel } from './model/meeting.model';
import { MeetingEntity } from './entities/meeting.entity';
import { LivekitModel } from '../video/model/livekit.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MeetingEntity])],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingModel, LivekitModel],
})
export class MeetingModule {}
