import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MeetingRecordingEntity } from './meeting-recording.entity';

@Entity('transcript_segments')
@Index(['recordingId', 'startTime'])
export class TranscriptSegmentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'segment_id' })
  segmentId: string;

  @Column({ name: 'recording_id', type: 'varchar', length: 36, nullable: false })
  recordingId: string;

  @ManyToOne(() => MeetingRecordingEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recording_id' })
  recording?: MeetingRecordingEntity | null;

  @Column({ name: 'speaker', length: 255, nullable: false })
  speaker: string;

  @Column({ name: 'start_time', type: 'float', nullable: false })
  startTime: number;

  @Column({ name: 'end_time', type: 'float', nullable: false })
  endTime: number;

  @Column({ name: 'text', type: 'text', nullable: false })
  text: string;

  @Column({ name: 'source', length: 32, nullable: false, default: 'ai' })
  source: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
