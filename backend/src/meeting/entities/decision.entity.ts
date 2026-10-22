import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MeetingRecordingEntity } from './meeting-recording.entity';

@Entity('decisions')
@Index(['recordingId'])
export class DecisionEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'decision_id' })
  decisionId: string;

  @Column({ name: 'recording_id', type: 'varchar', length: 36, nullable: false })
  recordingId: string;

  @ManyToOne(() => MeetingRecordingEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recording_id' })
  recording?: MeetingRecordingEntity | null;

  @Column({ name: 'decision', type: 'text', nullable: false })
  decision: string;

  @Column({ name: 'timestamp', type: 'float', nullable: false })
  timestamp: number;

  @Column({ name: 'context', type: 'text', nullable: true })
  context: string | null;

  @Column({ name: 'source', length: 32, nullable: false, default: 'ai' })
  source: string;

  @Column({ name: 'origin_key', type: 'varchar', length: 64, nullable: true })
  originKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
