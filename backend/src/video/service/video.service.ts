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
import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { LivekitModel } from '../model/livekit.model';

@Injectable()
export class VideoService {

    constructor(
        private readonly livekitModel: LivekitModel,
    ) { }

    async createRoom(roomName: string) {

        try {

            const room =
                await this.livekitModel.createRoom(roomName);

            return {
                success: true,
                message: 'Room created successfully',
                room,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to create room',
            );

        }

    }

    async generateToken(
        roomName: string,
        participantName: string,
    ) {

        try {

            const token =
                await this.livekitModel.generateToken(
                    roomName,
                    participantName,
                );

            return {
                success: true,
                token,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to generate access token',
            );

        }

    }

    async getParticipants(roomName: string) {

        try {

            const participants =
                await this.livekitModel.getParticipants(roomName);

            return {
                success: true,
                participants,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to fetch room participants',
            );

        }

    }

    async endRoom(roomName: string) {

        try {

            await this.livekitModel.endRoom(roomName);

            return {
                success: true,
                message: 'Room ended successfully',
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to end LiveKit room',
            );

        }

    }

}