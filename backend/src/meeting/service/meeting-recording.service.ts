import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingRecordingEntity } from '../entities/meeting-recording.entity';

@Injectable()
export class MeetingRecordingService {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingRepo: Repository<MeetingEntity>,
    @InjectRepository(MeetingRecordingEntity)
    private readonly recordingRepo: Repository<MeetingRecordingEntity>,
  ) {}

  async upsertForRoom(input: {
    roomName: string;
    meetingId?: string | null;
    egressId?: string | null;
    status?: string;
    filePath?: string | null;
    fileName?: string | null;
    durationSeconds?: number;
    fileSizeBytes?: number;
    meetnoteMeetingId?: string | null;
    meetnoteStatus?: string;
    errorMessage?: string | null;
  }) {
    const meeting = input.meetingId
      ? await this.meetingRepo.findOne({ where: { meetingId: input.meetingId } })
      : await this.meetingRepo.findOne({ where: { roomName: input.roomName } });

    let record = input.egressId
      ? await this.recordingRepo.findOne({ where: { egressId: input.egressId } })
      : null;

    if (!record && meeting) {
      record = await this.recordingRepo.findOne({
        where: { meetingId: meeting.meetingId, roomName: input.roomName },
        order: { createdAt: 'DESC' },
      });
    }

    if (!record) {
      record = this.recordingRepo.create({
        meetingId: meeting?.meetingId ?? null,
        roomName: input.roomName,
        egressId: input.egressId ?? null,
        status: input.status ?? 'starting',
        filePath: input.filePath ?? null,
        fileName: input.fileName ?? null,
        durationSeconds: input.durationSeconds ?? 0,
        fileSizeBytes: input.fileSizeBytes ?? 0,
        meetnoteMeetingId: input.meetnoteMeetingId ?? null,
        meetnoteStatus: input.meetnoteStatus ?? 'pending',
        errorMessage: input.errorMessage ?? null,
      });
    } else {
      record.meetingId = meeting?.meetingId ?? record.meetingId ?? null;
      record.roomName = input.roomName;
      if (input.egressId) record.egressId = input.egressId;
      if (input.status) record.status = input.status;
      if (input.filePath !== undefined) record.filePath = input.filePath;
      if (input.fileName !== undefined) record.fileName = input.fileName;
      if (input.durationSeconds !== undefined) record.durationSeconds = input.durationSeconds;
      if (input.fileSizeBytes !== undefined) record.fileSizeBytes = input.fileSizeBytes;
      if (input.meetnoteMeetingId !== undefined) record.meetnoteMeetingId = input.meetnoteMeetingId;
      if (input.meetnoteStatus !== undefined) record.meetnoteStatus = input.meetnoteStatus;
      if (input.errorMessage !== undefined) record.errorMessage = input.errorMessage;
    }

    return this.recordingRepo.save(record);
  }

  findByMeetingId(meetingId: string) {
    return this.recordingRepo.find({
      where: { meetingId },
      order: { createdAt: 'DESC' },
    });
  }

  findByEgressId(egressId: string) {
    return this.recordingRepo.findOne({ where: { egressId } });
  }

  findByRecordingId(recordingId: string) {
    return this.recordingRepo.findOne({ where: { recordingId } });
  }

  async findMeetingByIdAndUser(meetingId: string, userId: string) {
    return this.meetingRepo.findOne({ where: { meetingId, userId } });
  }

  async updateProcessingStatus(
    egressId: string,
    patch: Partial<MeetingRecordingEntity>,
  ) {
    const record = await this.findByEgressId(egressId);
    if (!record) return null;
    Object.assign(record, patch);
    return this.recordingRepo.save(record);
  }
}
