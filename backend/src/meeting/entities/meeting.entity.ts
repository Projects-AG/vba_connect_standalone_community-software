import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('meetings')
export class MeetingEntity {
  @PrimaryColumn({ name: 'meeting_id', type: 'varchar', length: 36 })
  meetingId: string;

  @Column({ name: 'room_name', length: 120 })
  roomName: string;

  @Column({ name: 'meeting_title', length: 255 })
  meetingTitle: string;

  @Column({ name: 'meeting_type', length: 40 })
  meetingType: string;

  @Column({ name: 'call_type', length: 40 })
  callType: string;

  @Column({ name: 'meeting_date', length: 40, default: '' })
  meetingDate: string;

  @Column({ name: 'meeting_time', length: 40, default: '' })
  meetingTime: string;

  @Column({ length: 120, default: '' })
  host: string;

  @Column({ name: 'leader_id', type: 'varchar', length: 36, nullable: true })
  leaderId: string | null;

  @Column({ name: 'leader_name', length: 120, default: '' })
  leaderName: string;

  @Column({ type: 'simple-json' })
  participants: string[];

  @Column({ name: 'participant_count', type: 'int', default: 0 })
  participantCount: number;

  @Column({ name: 'meeting_link', length: 255, default: '' })
  meetingLink: string;

  @Column({ length: 40, default: 'Live' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
