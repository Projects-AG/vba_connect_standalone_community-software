import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MeetingEntity } from './meeting.entity';

@Entity('meeting_recordings')
export class MeetingRecordingEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'recording_id' })
  recordingId: string;

  @Column({ name: 'meeting_id', type: 'varchar', length: 36, nullable: true })
  meetingId: string | null;

  @ManyToOne(() => MeetingEntity, (meeting) => meeting.recordings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_id' })
  meeting?: MeetingEntity | null;

  @Column({ name: 'room_name', type: 'varchar', length: 120, nullable: true })
  roomName: string | null;

  @Column({ name: 'egress_id', type: 'varchar', length: 120, nullable: true })
  egressId: string | null;

  @Column({ name: 'recording_path', type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ name: 'recording_status', length: 40, default: 'starting' })
  status: string;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ name: 'file_size_bytes', type: 'int', default: 0 })
  fileSizeBytes: number;

  @Column({ name: 'meetnote_meeting_id', type: 'varchar', length: 120, nullable: true })
  meetnoteMeetingId: string | null;

  @Column({ name: 'meetnote_status', length: 40, default: 'pending' })
  meetnoteStatus: string;

  @Column({ name: 'transcript_status', length: 40, default: 'pending' })
  transcriptStatus: string;

  @Column({ name: 'intelligence_status', length: 40, default: 'pending' })
  intelligenceStatus: string;

  @Column({ name: 'processing_status', length: 40, default: 'pending' })
  processingStatus: string;

  @Column({ name: 'transcript_error', type: 'text', nullable: true })
  transcriptError: string | null;

  @Column({ name: 'intelligence_error', type: 'text', nullable: true })
  intelligenceError: string | null;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'key_points', type: 'simple-json', nullable: true })
  keyPoints: Array<{ text: string; timestamp: number | null }> | null;

  @Column({ name: 'open_questions', type: 'simple-json', nullable: true })
  openQuestions: Array<{ question: string; timestamp: number | null }> | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
