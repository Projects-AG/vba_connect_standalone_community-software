import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('call_logs')
export class CallLogEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ name: 'caller_user_id', type: 'varchar', length: 36 })
  callerUserId: string;

  @Column({ name: 'caller_name', length: 120 })
  callerName: string;

  @Index()
  @Column({ name: 'callee_user_id', type: 'varchar', length: 36 })
  calleeUserId: string;

  @Column({ name: 'callee_name', length: 120 })
  calleeName: string;

  @Column({ name: 'meeting_id', type: 'varchar', length: 36, nullable: true })
  meetingId: string | null;

  @Column({ name: 'room_name', length: 120, default: '' })
  roomName: string;

  /** audio | video */
  @Column({ name: 'media_type', length: 20, default: 'audio' })
  mediaType: string;

  /** ringing | answered | missed | cancelled | ended */
  @Column({ length: 40, default: 'ringing' })
  status: string;

  @CreateDateColumn({ name: 'started_at', type: 'datetime' })
  startedAt: Date;

  @Column({ name: 'answered_at', type: 'datetime', nullable: true })
  answeredAt: Date | null;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
