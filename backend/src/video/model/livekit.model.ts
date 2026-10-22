import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AccessToken,
    EgressStatus,
    EncodedFileOutput,
    EncodedFileType,
    EgressClient,
    RoomServiceClient,
} from 'livekit-server-sdk';

export { EgressStatus };

@Injectable()
export class LivekitModel {

    private roomService: RoomServiceClient;
    private egressClient: EgressClient;

    constructor(
        private readonly configService: ConfigService,
    ) {

        const host = this.configService.get<string>('LIVEKIT_HOST');
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

        this.roomService = new RoomServiceClient(
            host!,
            apiKey!,
            apiSecret!,
        );

        this.egressClient = new EgressClient(
            host!,
            apiKey!,
            apiSecret!,
        );

    }

    private validateRoomName(roomName: string): string {

        const trimmed = roomName?.trim();

        if (!trimmed) {
            throw new BadRequestException('Room name is required');
        }

        if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(trimmed)) {
            throw new BadRequestException('Room name contains invalid characters');
        }

        return trimmed;

    }

    private validateEgressId(egressId: string): string {

        const trimmed = egressId?.trim();

        if (!trimmed) {
            throw new BadRequestException('Egress ID is required');
        }

        if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(trimmed)) {
            throw new BadRequestException('Egress ID contains invalid characters');
        }

        return trimmed;

    }

    private buildRecordingPath(roomName: string): string {

        const safeRoomName = this.validateRoomName(roomName)
            .replace(/[^A-Za-z0-9._-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'room';

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        return `/out/${safeRoomName}-${timestamp}.mp4`;

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
        identity: string,
        displayName?: string,
    ) {

        const token = new AccessToken(
            this.configService.get<string>('LIVEKIT_API_KEY')!,
            this.configService.get<string>('LIVEKIT_API_SECRET')!,
            {
                identity,
                name: displayName || identity,
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

    async startRecording(roomName: string) {

        const validatedRoomName = this.validateRoomName(roomName);

        try {

            return await this.egressClient.startRoomCompositeEgress(
                validatedRoomName,
                new EncodedFileOutput({
                    fileType: EncodedFileType.MP4,
                    filepath: this.buildRecordingPath(validatedRoomName),
                }),
            );

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to start LiveKit room recording',
            );

        }

    }

    async stopRecording(egressId: string) {

        const validatedEgressId = this.validateEgressId(egressId);

        try {

            return await this.egressClient.stopEgress(validatedEgressId);

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to stop LiveKit room recording',
            );

        }

    }

    async getRecording(egressId: string) {

        const validatedEgressId = this.validateEgressId(egressId);

        try {

            const items = await this.egressClient.listEgress({
                egressId: validatedEgressId,
            });

            const record = items.find(
                (item) => item.egressId === validatedEgressId,
            );

            if (!record) {
                throw new NotFoundException('Recording not found');
            }

            return record;

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to fetch LiveKit recording',
            );

        }

    }

}