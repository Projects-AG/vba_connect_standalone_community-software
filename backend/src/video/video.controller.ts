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

import { VideoService } from './video.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateTokenDto } from './dto/create-token.dto';

@Controller('video')
export class VideoController {

    constructor(
        private readonly videoService: VideoService,
    ) {}

    @Post('create-room')
    createRoom(
        @Body() dto: CreateRoomDto,
    ) {

        return this.videoService.createRoom(
            dto.roomName,
        );

    }

    @Post('generate-token')
    generateToken(
        @Body() dto: CreateTokenDto,
    ) {

        return this.videoService.generateToken(
            dto.roomName,
            dto.participantName,
        );

    }

    @Get('participants/:roomName')
    getParticipants(
        @Param('roomName') roomName: string,
    ) {

        return this.videoService.getParticipants(
            roomName,
        );

    }

    @Delete('end-room/:roomName')
    endRoom(
        @Param('roomName') roomName: string,
    ) {

        return this.videoService.endRoom(
            roomName,
        );

    }

}