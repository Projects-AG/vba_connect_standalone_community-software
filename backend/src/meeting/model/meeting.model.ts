import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingEntity } from '../entities/meeting.entity';

@Injectable()
export class MeetingModel {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingsRepo: Repository<MeetingEntity>,
  ) {}

  async create(meeting: Partial<MeetingEntity>) {
    const entity = this.meetingsRepo.create(meeting);
    return this.meetingsRepo.save(entity);
  }

  findAll() {
    return this.meetingsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string) {
    return this.meetingsRepo.findOne({ where: { meetingId: id } });
  }

  async update(id: string, data: Partial<MeetingEntity>) {
    const meeting = await this.findById(id);
    if (!meeting) return null;
    Object.assign(meeting, data);
    return this.meetingsRepo.save(meeting);
  }

  async delete(id: string) {
    const result = await this.meetingsRepo.delete({ meetingId: id });
    return (result.affected ?? 0) > 0;
  }

  async addParticipant(id: string, participant: string) {
    const meeting = await this.findById(id);
    if (!meeting) return null;

    const participants = Array.isArray(meeting.participants)
      ? [...meeting.participants]
      : [];

    if (!participants.includes(participant)) {
      participants.push(participant);
      meeting.participants = participants;
      meeting.participantCount = participants.length;
      return this.meetingsRepo.save(meeting);
    }

    return meeting;
  }

  async removeParticipant(id: string, participant: string) {
    const meeting = await this.findById(id);
    if (!meeting) return null;

    const participants = (meeting.participants || []).filter(
      (p) => p !== participant,
    );
    meeting.participants = participants;
    meeting.participantCount = participants.length;
    return this.meetingsRepo.save(meeting);
  }
}
