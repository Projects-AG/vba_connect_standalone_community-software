import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MeetingModel } from '../model/meeting.model';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { LivekitModel } from '../../video/model/livekit.model';
import { MeetingRecordingService } from './meeting-recording.service';
import { MeetNoteIntegrationService } from './meetnote-integration.service';
import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingRecordingEntity } from '../entities/meeting-recording.entity';
import { ActionItemEntity } from '../entities/action-item.entity';

@Injectable()
export class MeetingService {
  constructor(
    private readonly meetingModel: MeetingModel,
    private readonly livekitModel: LivekitModel,
    private readonly meetingRecordingService: MeetingRecordingService,
    private readonly meetNoteIntegrationService: MeetNoteIntegrationService,
    @InjectRepository(MeetingRecordingEntity)
    private readonly recordingRepo: Repository<MeetingRecordingEntity>,
    @InjectRepository(ActionItemEntity)
    private readonly actionItemRepo: Repository<ActionItemEntity>,
  ) {}

  async createMeeting(dto: CreateMeetingDto, userId: string) {
    const meetingId = randomUUID();

    const meeting = {
      meetingId,
      roomName: dto.roomName,
      meetingTitle: dto.meetingTitle,
      meetingType: dto.meetingType,
      callType: dto.callType,
      meetingDate: dto.meetingDate || '',
      meetingTime: dto.meetingTime || '',
      host: dto.host || '',
      leaderId: dto.leaderId || null,
      leaderName: dto.leaderName || '',
      userId,
      participants: dto.participants || [],
      participantCount: (dto.participants || []).length,
      meetingLink: `/join/${meetingId}`,
      status:
        dto.meetingType === 'scheduled' || dto.meetingType === 'schedule'
          ? 'Scheduled'
          : 'Live',
    };

    // LiveKit auto-creates rooms on first join; don't block meeting persistence if server is down.
    try {
      await this.livekitModel.createRoom(meeting.roomName);
    } catch {
      // continue — token generation still works; room appears when someone connects
    }

    const created = await this.meetingModel.create(meeting);

    return {
      success: true,
      message: 'Meeting created successfully',
      data: created,
    };
  }

  async getMeetings(userId: string) {
    const meetings = await this.meetingModel.findAll(userId);
    const enriched = await Promise.all(
      meetings.map(async (meeting) => ({
        ...meeting,
        recordings: await this.meetingRecordingService.findByMeetingId(meeting.meetingId),
      })),
    );

    return {
      success: true,
      data: enriched,
    };
  }

  async getMeeting(id: string, userId: string) {
    const meeting = await this.meetingModel.findById(id, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    const recordings = await this.meetingRecordingService.findByMeetingId(meeting.meetingId);

    return {
      success: true,
      data: {
        ...meeting,
        recordings,
      },
    };
  }

  async getMeetingInsights(meetingId: string, userId: string) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    // Delegate to MeetNote APIs via MeetNoteIntegrationService. Loop does not
    // store transcript/AI results from Python anymore; MeetNote owns them.
    return this.meetNoteIntegrationService.getMeetingInsights(meetingId);
  }

  async getMeetingExport(
    meetingId: string,
    format: string,
    sections: Record<string, boolean>,
    userId: string,
  ) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    const recordings = await this.meetingRecordingService.findByMeetingId(
      meetingId,
    );

    const recording = recordings.find(
      (r) => r.meetnoteMeetingId && r.meetnoteStatus === 'uploaded',
    );
    if (!recording?.meetnoteMeetingId) {
      throw new NotFoundException('No MeetNote recording found for this meeting');
    }

    return this.meetNoteIntegrationService.exportMeeting(
      recording.meetnoteMeetingId,
      format,
      sections,
    );
  }

  async updateActionItemStatus(
    meetingId: string,
    originKey: string,
    status: string,
    userId: string,
  ) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    const recordings = await this.meetingRecordingService.findByMeetingId(
      meetingId,
    );

    // Find the action item by originKey across all recordings of this meeting.
    let targetItem: ActionItemEntity | null = null;
    for (const recording of recordings) {
      const item = await this.actionItemRepo.findOne({
        where: { recordingId: recording.recordingId, originKey },
      });
      if (item) {
        targetItem = item;
        break;
      }
    }

    if (!targetItem) {
      throw new NotFoundException('Action item not found');
    }

    const validStatuses = ['pending', 'completed'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error(`Invalid status: ${status}`);
    }

    targetItem.status = status.toLowerCase();
    await this.actionItemRepo.save(targetItem);

    return {
      success: true,
      data: {
        id: targetItem.actionItemId,
        originKey: targetItem.originKey,
        task: targetItem.task,
        status: targetItem.status,
        recordingId: targetItem.recordingId,
      },
    };
  }

  async updateMeeting(id: string, body: any, userId: string) {
    const meeting = await this.meetingModel.findById(id, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.meetingModel.update(id, body);
  }

  async deleteMeeting(id: string, userId: string) {
    const meeting = await this.meetingModel.findById(id, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');
    await this.meetingModel.delete(id);
    return {
      success: true,
      message: 'Meeting deleted',
    };
  }

  async joinMeeting(meetingId: string, participant: string, userId: string) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.meetingModel.addParticipant(meetingId, participant);
  }

  async leaveMeeting(meetingId: string, participant: string, userId: string) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.meetingModel.removeParticipant(meetingId, participant);
  }

  async getParticipants(meetingId: string, userId: string) {
    const meeting = await this.meetingModel.findById(meetingId, userId);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return {
      success: true,
      data: meeting.participants,
    };
  }

  async generateToken(
    meetingId: string,
    user: { id: string; name: string },
    ownerId: string,
  ) {
    const meeting = await this.meetingModel.findById(meetingId, ownerId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    const token = await this.livekitModel.generateToken(
      meeting.roomName,
      user.id,
      user.name,
    );

    return {
      success: true,
      roomName: meeting.roomName,
      token,
    };
  }

  async connectMeeting(
    meetingId: string,
    user: { id: string; name: string },
    ownerId: string,
  ) {
    const meeting = await this.meetingModel.findById(meetingId, ownerId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    await this.meetingModel.addParticipant(meetingId, user.name);

    const token = await this.livekitModel.generateToken(
      meeting.roomName,
      user.id,
      user.name,
    );

    return {
      success: true,
      meeting: await this.meetingModel.findById(meetingId),
      token,
      roomName: meeting.roomName,
    };
  }
}
