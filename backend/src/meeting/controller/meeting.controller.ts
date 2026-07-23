import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { MeetingService } from '../service/meeting.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthUser = { id: string; name: string; email: string };

@ApiTags('Meeting')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('meeting')
export class MeetingController {

    constructor(
        private readonly meetingService: MeetingService,
    ) { }

    @Post('create')
    createMeeting(
        @Body() dto: CreateMeetingDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.createMeeting({
            ...dto,
            host: dto.host || user.name,
        });
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
        @CurrentUser() user: AuthUser,
        @Body('participant') participant?: string,
    ) {
        return this.meetingService.joinMeeting(
            meetingId,
            participant || user.name,
        );
    }

    @Post(':meetingId/leave')
    leaveMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
        @Body('participant') participant?: string,
    ) {
        return this.meetingService.leaveMeeting(
            meetingId,
            participant || user.name,
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
        @CurrentUser() user: AuthUser,
        @Body('participant') participant?: string,
    ) {
        return this.meetingService.generateToken(
            meetingId,
            participant || user.name,
        );
    }

    @Post(':meetingId/connect')
    connectMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
        @Body('participant') participant?: string,
    ) {
        return this.meetingService.connectMeeting(
            meetingId,
            participant || user.name,
        );
    }
}
