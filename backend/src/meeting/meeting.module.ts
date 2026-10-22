import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeetingController } from './controller/meeting.controller';
import { MeetingService } from './service/meeting.service';
import { MeetingRecordingService } from './service/meeting-recording.service';
import { RecordingProcessingService } from './service/recording-processing.service';
import { MeetingModel } from './model/meeting.model';
import { MeetingEntity } from './entities/meeting.entity';
import { MeetingRecordingEntity } from './entities/meeting-recording.entity';
import { TranscriptSegmentEntity } from './entities/transcript-segment.entity';
import { ActionItemEntity } from './entities/action-item.entity';
import { DecisionEntity } from './entities/decision.entity';
import { MeetNoteIntegrationService } from './service/meetnote-integration.service';
import { LivekitModel } from '../video/model/livekit.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      MeetingEntity,
      MeetingRecordingEntity,
      TranscriptSegmentEntity,
      ActionItemEntity,
      DecisionEntity,
    ]),
  ],
  controllers: [MeetingController],
  providers: [
    MeetingService,
    MeetingModel,
    MeetingRecordingService,
    RecordingProcessingService,
    MeetNoteIntegrationService,
    LivekitModel,
  ],
  exports: [
    MeetingService,
    MeetingRecordingService,
    RecordingProcessingService,
    MeetNoteIntegrationService,
  ],
})
export class MeetingModule {}
