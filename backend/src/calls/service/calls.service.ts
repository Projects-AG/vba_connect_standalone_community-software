import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { CallLogEntity } from '../entities/call-log.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { MeetingService } from '../../meeting/service/meeting.service';

const RING_TIMEOUT_MS = 45_000;

type AuthUser = { id: string; name: string; email: string };

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(CallLogEntity)
    private readonly callLogs: Repository<CallLogEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly meetingService: MeetingService,
  ) {}

  private async expireStaleRinging(userId: string) {
    const cutoff = new Date(Date.now() - RING_TIMEOUT_MS);
    const stale = await this.callLogs
      .createQueryBuilder('c')
      .where('c.status = :status', { status: 'ringing' })
      .andWhere('(c.caller_user_id = :uid OR c.callee_user_id = :uid)', {
        uid: userId,
      })
      .andWhere('c.started_at < :cutoff', { cutoff })
      .getMany();

    for (const row of stale) {
      row.status = 'missed';
      row.endedAt = new Date();
      await this.callLogs.save(row);
    }
  }

  private toHistoryItem(row: CallLogEntity, viewerId: string) {
    const isCaller = row.callerUserId === viewerId;
    const mediaType = row.mediaType === 'video' ? 'video' : 'audio';
    return {
      id: row.id,
      direction: isCaller ? 'outgoing' : 'incoming',
      status: row.status,
      mediaType,
      callMode: mediaType,
      peerUserId: isCaller ? row.calleeUserId : row.callerUserId,
      peerName: isCaller ? row.calleeName : row.callerName,
      meetingId: row.meetingId,
      roomName: row.roomName,
      startedAt: row.startedAt,
      answeredAt: row.answeredAt,
      endedAt: row.endedAt,
      durationSeconds: row.durationSeconds,
    };
  }

  async startCall(
    user: AuthUser,
    peerUserId: string,
    mediaType: 'audio' | 'video' = 'audio',
  ) {
    if (peerUserId === user.id) {
      throw new BadRequestException('Cannot call yourself');
    }

    const peer = await this.users.findOne({ where: { id: peerUserId } });
    if (!peer) throw new NotFoundException('User not found');

    const mode = mediaType === 'video' ? 'video' : 'audio';
    const roomName = randomUUID();
    const meetingRes = await this.meetingService.createMeeting({
      roomName,
      meetingTitle:
        mode === 'video'
          ? `Video call with ${peer.name}`
          : `Call with ${peer.name}`,
      meetingType: 'instant',
      callType: '1:1',
      meetingDate: '',
      meetingTime: '',
      host: user.name,
      participants: [user.name, peer.name],
    } as any);

    const meeting = meetingRes.data;
    const id = randomUUID();
    const row = this.callLogs.create({
      id,
      callerUserId: user.id,
      callerName: user.name,
      calleeUserId: peer.id,
      calleeName: peer.name,
      meetingId: meeting.meetingId,
      roomName: meeting.roomName || roomName,
      mediaType: mode,
      status: 'ringing',
      answeredAt: null,
      endedAt: null,
      durationSeconds: 0,
    });
    await this.callLogs.save(row);

    return {
      success: true,
      data: {
        ...this.toHistoryItem(row, user.id),
        meetingTitle: meeting.meetingTitle,
        meetingLink: meeting.meetingLink,
      },
    };
  }

  async answerCall(user: AuthUser, callId: string) {
    await this.expireStaleRinging(user.id);
    const row = await this.callLogs.findOne({ where: { id: callId } });
    if (!row) throw new NotFoundException('Call not found');
    if (row.calleeUserId !== user.id) {
      throw new BadRequestException('Only the callee can answer');
    }
    if (row.status !== 'ringing') {
      throw new BadRequestException(`Call is ${row.status}`);
    }

    row.status = 'answered';
    row.answeredAt = new Date();
    await this.callLogs.save(row);

    return {
      success: true,
      data: {
        ...this.toHistoryItem(row, user.id),
        meetingTitle: `Call with ${row.callerName}`,
      },
    };
  }

  async endCall(user: AuthUser, callId: string) {
    const row = await this.callLogs.findOne({ where: { id: callId } });
    if (!row) throw new NotFoundException('Call not found');
    if (row.callerUserId !== user.id && row.calleeUserId !== user.id) {
      throw new BadRequestException('Not a participant');
    }

    if (row.status === 'ringing') {
      // Caller hangs up unanswered → missed for callee; cancelled if we want nuance
      row.status = user.id === row.callerUserId ? 'missed' : 'cancelled';
      row.endedAt = new Date();
      await this.callLogs.save(row);
      return { success: true, data: this.toHistoryItem(row, user.id) };
    }

    if (row.status === 'answered') {
      row.status = 'ended';
      row.endedAt = new Date();
      if (row.answeredAt) {
        row.durationSeconds = Math.max(
          0,
          Math.floor((row.endedAt.getTime() - row.answeredAt.getTime()) / 1000),
        );
      }
      await this.callLogs.save(row);
      return { success: true, data: this.toHistoryItem(row, user.id) };
    }

    return { success: true, data: this.toHistoryItem(row, user.id) };
  }

  async getCall(user: AuthUser, callId: string) {
    await this.expireStaleRinging(user.id);
    const row = await this.callLogs.findOne({ where: { id: callId } });
    if (!row) throw new NotFoundException('Call not found');
    if (row.callerUserId !== user.id && row.calleeUserId !== user.id) {
      throw new BadRequestException('Not a participant');
    }
    return {
      success: true,
      data: this.toHistoryItem(row, user.id),
    };
  }

  async getHistory(user: AuthUser) {
    await this.expireStaleRinging(user.id);

    const rows = await this.callLogs
      .createQueryBuilder('c')
      .where('c.caller_user_id = :uid OR c.callee_user_id = :uid', {
        uid: user.id,
      })
      .orderBy('c.started_at', 'DESC')
      .take(100)
      .getMany();

    return {
      success: true,
      data: rows.map((r) => this.toHistoryItem(r, user.id)),
    };
  }

  async getIncoming(user: AuthUser) {
    await this.expireStaleRinging(user.id);

    const rows = await this.callLogs.find({
      where: { calleeUserId: user.id, status: 'ringing' },
      order: { startedAt: 'DESC' },
      take: 10,
    });

    return {
      success: true,
      data: rows.map((r) => this.toHistoryItem(r, user.id)),
    };
  }
}
