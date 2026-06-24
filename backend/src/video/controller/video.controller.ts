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
} from '@nestjs/common';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

import { VideoService } from '../service/video.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { CreateTokenDto } from '../dto/create-token.dto';

@ApiTags('Video')
@Controller('video')
export class VideoController {

    constructor(
        private readonly videoService: VideoService,
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

}