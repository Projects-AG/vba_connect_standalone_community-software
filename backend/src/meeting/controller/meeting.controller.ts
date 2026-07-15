import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Patch
} from '@nestjs/common';

import { MeetingService } from '../service/meeting.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';

@Controller('meeting')
export class MeetingController {

    constructor(
        private readonly meetingService: MeetingService,
    ) { }

    @Post('create')
    createMeeting(
        @Body() dto: CreateMeetingDto,
    ) {
        return this.meetingService.createMeeting(dto);
    }

    @Get()
    getMeetings() {
        return this.meetingService.getMeetings();
    }

    @Get(':meetingId')
    getMeeting(
        @Param('meetingId') meetingId: string,
    ) {
        return this.meetingService.getMeeting(meetingId);
    }

    @Put(':meetingId')
    updateMeeting(
        @Param('meetingId') meetingId: string,
        @Body() body: any,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            body,
        );
    }

    @Delete(':meetingId')
    deleteMeeting(
        @Param('meetingId') meetingId: string,
    ) {
        return this.meetingService.deleteMeeting(
            meetingId,
        );
    }

    @Patch(':meetingId/start')
    startMeeting(
        @Param('meetingId') meetingId: string,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            {
                status: 'Live',
            },
        );
    }

    @Patch(':meetingId/end')
    endMeeting(
        @Param('meetingId') meetingId: string,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            {
                status: 'Ended',
            },
        );
    }

    @Post(':meetingId/join')
    joinMeeting(
        @Param('meetingId') meetingId: string,
        @Body('participant') participant: string,
    ) {
        return this.meetingService.joinMeeting(
            meetingId,
            participant,
        );
    }

    @Post(':meetingId/leave')
    leaveMeeting(
        @Param('meetingId') meetingId: string,
        @Body('participant') participant: string,
    ) {
        return this.meetingService.leaveMeeting(
            meetingId,
            participant,
        );
    }

    @Get(':meetingId/participants')
    getParticipants(
        @Param('meetingId') meetingId: string,
    ) {
        return this.meetingService.getParticipants(
            meetingId,
        );
    }

    @Post(':meetingId/token')
    generateToken(
        @Param('meetingId') meetingId: string,
        @Body('participant') participant: string,
    ) {
        return this.meetingService.generateToken(
            meetingId,
            participant,
        );
    }

    @Post(':meetingId/connect')
    connectMeeting(
        @Param('meetingId') meetingId: string,
        @Body('participant') participant: string,
    ) {
        return this.meetingService.connectMeeting(
            meetingId,
            participant,
        );
    }
}