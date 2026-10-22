// import { Body, Controller, Post } from '@nestjs/common';
// import { VideoService } from './video.service';
// import { CreateRoomDto } from './dto/create-room.dto';

// @Controller('video')
// export class VideoController {

//     constructor(private readonly videoService: VideoService) { }

//     @Post('create-room')
//     createRoom(
//         @Body() createRoomDto: CreateRoomDto,
//     ) {

//         return this.videoService.createRoom(
//             createRoomDto.roomName,
//         );

//     }

// }

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

import { VideoService } from '../service/video.service';
import { MeetingRecordingService } from '../../meeting/service/meeting-recording.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { CreateTokenDto } from '../dto/create-token.dto';
import { StartRecordingDto } from '../dto/start-recording.dto';
import { StopRecordingDto } from '../dto/stop-recording.dto';

type AuthUser = { id: string; name: string; email: string };

@ApiTags('Video')
@Controller('video')
export class VideoController {

    constructor(
        private readonly videoService: VideoService,
        private readonly meetingRecordingService: MeetingRecordingService,
    ) { }
    @ApiOperation({
        summary: 'Create a LiveKit Room',
    })
    @ApiResponse({
        status: 201,
        description: 'Room created successfully',
    })
    @Post('create-room')
    createRoom(
        @Body() dto: CreateRoomDto,
    ) {

        return this.videoService.createRoom(
            dto.roomName,
        );

    }
    @ApiOperation({
        summary: 'Generate Access Token',
    })
    @ApiResponse({
        status: 201,
        description: 'Token generated successfully',
    })
    @Post('generate-token')
    generateToken(
        @Body() dto: CreateTokenDto,
    ) {

        return this.videoService.generateToken(
            dto.roomName,
            dto.participantName,
        );

    }
    @ApiOperation({
        summary: 'Get Room Participants',
    })
    @ApiResponse({
        status: 200,
        description: 'Participants fetched successfully',
    })
    @Get('participants/:roomName')
    getParticipants(
        @Param('roomName') roomName: string,
    ) {

        return this.videoService.getParticipants(
            roomName,
        );

    }
    @ApiOperation({
        summary: 'End LiveKit Room',
    })
    @ApiResponse({
        status: 200,
        description: 'Room ended successfully',
    })
    @Delete('end-room/:roomName')
    endRoom(
        @Param('roomName') roomName: string,
    ) {

        return this.videoService.endRoom(
            roomName,
        );

    }

    @ApiOperation({
        summary: 'Start MP4 room recording',
    })
    @ApiResponse({
        status: 201,
        description: 'Recording started successfully',
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('recording/start')
    startRecording(
        @Body() dto: StartRecordingDto,
    ) {

        return this.videoService.startRecording(
            dto.roomName,
        );

    }

    @ApiOperation({
        summary: 'Stop a LiveKit room recording',
    })
    @ApiResponse({
        status: 200,
        description: 'Recording stop requested successfully',
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('recording/stop')
    stopRecording(
        @Body() dto: StopRecordingDto,
    ) {

        return this.videoService.stopRecording(
            dto.egressId,
        );

    }

    @ApiOperation({
        summary: 'Get LiveKit recording status',
    })
    @ApiResponse({
        status: 200,
        description: 'Recording status returned successfully',
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('recording/:egressId')
    getRecording(
        @Param('egressId') egressId: string,
    ) {

        return this.videoService.getRecording(
            egressId,
        );

    }

    @ApiOperation({
        summary: 'Generate a short-lived playback token for a recording',
    })
    @ApiResponse({
        status: 200,
        description: 'Playback token returned successfully',
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('recording/:recordingId/playback-token')
    async generatePlaybackToken(
        @Param('recordingId') recordingId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return {
            token: await this.videoService.generatePlaybackToken(recordingId, user.id),
        };
    }

    @ApiOperation({
        summary: 'Download or stream a persisted meeting recording',
    })
    @ApiResponse({
        status: 200,
        description: 'Recording file returned successfully',
    })
    @ApiResponse({
        status: 206,
        description: 'Partial content returned for Range request',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - missing valid Bearer token or playback token',
    })
    @ApiResponse({
        status: 404,
        description: 'Recording not found',
    })
    @Get('recording/download/:recordingId')
    async downloadRecording(
        @Param('recordingId') recordingId: string,
        @Query('token') playbackToken: string | undefined,
        @Res() res: any,
        @CurrentUser() user?: AuthUser,
    ) {
        const file = await this.videoService.getRecordingFile(
            recordingId,
            user?.id,
            playbackToken,
        );

        const stat = require('fs').statSync(file.filePath);
        const fileSize = stat.size;

        // Support HTTP Range requests for native video playback/seeking.
        const range = res.req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const readStream = require('fs').createReadStream(file.filePath, {
                start,
                end,
            });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
                'Content-Disposition': `inline; filename="${encodeURIComponent(file.fileName)}"`,
                'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
            });
            readStream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Content-Disposition': `inline; filename="${encodeURIComponent(file.fileName)}"`,
                'Accept-Ranges': 'bytes',
                'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
            });
            require('fs').createReadStream(file.filePath).pipe(res);
        }
    }

}