import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MeetingModule } from '../meeting/meeting.module';
import { UserEntity } from '../auth/entities/user.entity';
import { CallLogEntity } from './entities/call-log.entity';
import { CallsController } from './controller/calls.controller';
import { CallsService } from './service/calls.service';

@Module({
  imports: [
    AuthModule,
    MeetingModule,
    TypeOrmModule.forFeature([CallLogEntity, UserEntity]),
  ],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
