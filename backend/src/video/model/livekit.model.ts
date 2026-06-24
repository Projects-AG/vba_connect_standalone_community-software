import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    RoomServiceClient,
    AccessToken,
} from 'livekit-server-sdk';

@Injectable()
export class LivekitModel {

    private roomService: RoomServiceClient;

    constructor(
        private readonly configService: ConfigService,
    ) {

        this.roomService = new RoomServiceClient(
            this.configService.get<string>('LIVEKIT_HOST')!,
            this.configService.get<string>('LIVEKIT_API_KEY')!,
            this.configService.get<string>('LIVEKIT_API_SECRET')!,
        );

    }

    async createRoom(roomName: string) {

        try {

            return await this.roomService.createRoom({
                name: roomName,
            });

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to create LiveKit room',
            );

        }

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

        return await token.toJwt();

    }

    async getParticipants(roomName: string) {

        return await this.roomService.listParticipants(roomName);

    }

    async endRoom(roomName: string) {

        await this.roomService.deleteRoom(roomName);

    }

}