import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('conversations')
@Index(['userLowId', 'userHighId'], { unique: true })
export class ConversationEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  /** Lexicographically smaller user id (stable 1:1 pair key) */
  @Column({ name: 'user_low_id', type: 'varchar', length: 36 })
  userLowId: string;

  /** Lexicographically larger user id */
  @Column({ name: 'user_high_id', type: 'varchar', length: 36 })
  userHighId: string;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date | null;

  @Column({ name: 'last_message_preview', length: 255, default: '' })
  lastMessagePreview: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
