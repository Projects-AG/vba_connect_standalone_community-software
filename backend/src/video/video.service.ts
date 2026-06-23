// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class VideoService {

//     createRoom(roomName: string) {

//         return {
//             success: true,
//             message: 'Room created successfully',
//             roomName,
//         };

//     }

// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    RoomServiceClient,
    AccessToken,
} from 'livekit-server-sdk';

@Injectable()
export class VideoService {

    private roomService: RoomServiceClient;

    constructor(
        private configService: ConfigService,
    ) {

        this.roomService = new RoomServiceClient(
            this.configService.get<string>('LIVEKIT_HOST')!,
            this.configService.get<string>('LIVEKIT_API_KEY')!,
            this.configService.get<string>('LIVEKIT_API_SECRET')!,
        );

    }

    async createRoom(roomName: string) {

        const room = await this.roomService.createRoom({
            name: roomName,
        });

        return {
            success: true,
            message: 'Room created successfully',
            room,
        };

    }

    async generateToken(
        roomName: string,
        participantName: string,
    ) {

        const token = new AccessToken(
            this.configService.get<string>('LIVEKIT_API_KEY')!,
            this.configService.get<string>('LIVEKIT_API_SECRET')!,
            {
                identity: participantName,
            },
        );

        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        return {
            success: true,
            token: await token.toJwt(),
        };

    }

    async getParticipants(roomName: string) {

        const participants =
            await this.roomService.listParticipants(roomName);

        return {
            success: true,
            participants,
        };

    }

    async endRoom(roomName: string) {

        await this.roomService.deleteRoom(roomName);

        return {
            success: true,
            message: 'Room ended successfully',
        };

    }

}