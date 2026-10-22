import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Patch,
    Query,
    Res,
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
        }, user.id);
    }

    @Get()
    getMeetings(
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.getMeetings(user.id);
    }

    @Get(':meetingId')
    getMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.getMeeting(meetingId, user.id);
    }

    @Get(':meetingId/insights')
    getMeetingInsights(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.getMeetingInsights(meetingId, user.id);
    }

    @Get(':meetingId/export')
    async exportMeeting(
        @Param('meetingId') meetingId: string,
        @Query('format') format: string,
        @Query('details') details: string,
        @Query('summary') summary: string,
        @Query('action_items') actionItems: string,
        @Query('decisions') decisions: string,
        @Query('transcript') transcript: string,
        @Res() res: any,
        @CurrentUser() user: AuthUser,
    ) {
        const sections = {
            details: details !== 'false',
            summary: summary !== 'false',
            action_items: actionItems !== 'false',
            decisions: decisions !== 'false',
            transcript: transcript !== 'false',
        };

        const result = await this.meetingService.getMeetingExport(
            meetingId,
            format || 'pdf',
            sections,
            user.id,
        );

        const contentType = result.headers['content-type'] || 'application/octet-stream';
        const contentDisposition = result.headers['content-disposition'];

        res.setHeader('Content-Type', contentType);
        if (contentDisposition) {
            res.setHeader('Content-Disposition', contentDisposition);
        }
        res.setHeader('Cache-Control', 'no-store');
        res.send(result.data);
    }

    @Patch(':meetingId/action-items/:originKey')
    async updateActionItemStatus(
        @Param('meetingId') meetingId: string,
        @Param('originKey') originKey: string,
        @Body() body: { status: string },
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.updateActionItemStatus(
            meetingId,
            originKey,
            body.status,
            user.id,
        );
    }

    @Put(':meetingId')
    updateMeeting(
        @Param('meetingId') meetingId: string,
        @Body() body: any,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            body,
            user.id,
        );
    }

    @Delete(':meetingId')
    deleteMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.deleteMeeting(meetingId, user.id);
    }

    @Patch(':meetingId/start')
    startMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            {
                status: 'Live',
            },
            user.id,
        );
    }

    @Patch(':meetingId/end')
    endMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.updateMeeting(
            meetingId,
            {
                status: 'Ended',
            },
            user.id,
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
            user.id,
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
            user.id,
        );
    }

    @Get(':meetingId/participants')
    getParticipants(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.getParticipants(meetingId, user.id);
    }

    @Post(':meetingId/token')
    generateToken(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.generateToken(meetingId, user, user.id);
    }

    @Post(':meetingId/connect')
    connectMeeting(
        @Param('meetingId') meetingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.meetingService.connectMeeting(meetingId, user, user.id);
    }
}
