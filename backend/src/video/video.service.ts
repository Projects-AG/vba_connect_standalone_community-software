import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoService {

    createRoom(roomName: string) {

        return {
            success: true,
            message: 'Room created successfully',
            roomName,
        };

    }

}