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

@Entity('action_items')
@Index(['recordingId'])
export class ActionItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'action_item_id' })
  actionItemId: string;

  @Column({ name: 'recording_id', type: 'varchar', length: 36, nullable: false })
  recordingId: string;

  @ManyToOne(() => MeetingRecordingEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recording_id' })
  recording?: MeetingRecordingEntity | null;

  @Column({ name: 'task', type: 'text', nullable: false })
  task: string;

  @Column({ name: 'assignee', type: 'varchar', length: 255, nullable: true })
  assignee: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'status', length: 50, nullable: false, default: 'pending' })
  status: string;

  @Column({ name: 'timestamp', type: 'float', nullable: true })
  timestamp: number | null;

  @Column({ name: 'source', length: 32, nullable: false, default: 'ai' })
  source: string;

  @Column({ name: 'origin_key', type: 'varchar', length: 64, nullable: true })
  originKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
