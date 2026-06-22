import { Body, Controller, Post } from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('video')
export class VideoController {

    constructor(private readonly videoService: VideoService) { }

    @Post('create-room')
    createRoom(
        @Body() createRoomDto: CreateRoomDto,
    ) {

        return this.videoService.createRoom(
            createRoomDto.roomName,
        );

    }

}