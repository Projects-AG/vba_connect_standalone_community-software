import { Module } from '@nestjs/common';

import { MeetingController } from './controller/meeting.controller';
import { MeetingService } from './service/meeting.service';
import { MeetingModel } from './model/meeting.model';
import { LivekitModel } from '../video/model/livekit.model';

@Module({
  controllers: [
    MeetingController,
  ],
 providers: [

  MeetingService,

  MeetingModel,

  LivekitModel,

],
})
export class MeetingModule {}