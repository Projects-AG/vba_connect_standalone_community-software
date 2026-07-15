import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { MeetingModel } from '../model/meeting.model';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { LivekitModel } from '../../video/model/livekit.model';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MeetingService {

    constructor(
        private readonly meetingModel: MeetingModel,
        private readonly livekitModel: LivekitModel,
    ) { }

    async createMeeting(dto: CreateMeetingDto) {

        const meetingId = randomUUID();

        const meeting = {

            meetingId,

            roomName: dto.roomName,

            meetingTitle: dto.meetingTitle,

            meetingType: dto.meetingType,

            callType: dto.callType,

            meetingDate: dto.meetingDate || '',

            meetingTime: dto.meetingTime || '',

            host: dto.host,

            leaderId: dto.leaderId || null,

            leaderName: dto.leaderName || '',

            participants: dto.participants,

            participantCount: dto.participants.length,

            meetingLink: `/join/${meetingId}`,

            status:
                dto.meetingType === 'scheduled'
                    ? 'Scheduled'
                    : 'Live',

            createdAt: new Date(),
        };

        try {

            await this.livekitModel.createRoom(
                meeting.roomName,
            );

        } catch (error) {

            throw new InternalServerErrorException(
                'Unable to create LiveKit room',
            );

        }

        const created =
            this.meetingModel.create(meeting);

        return {
            success: true,
            message: 'Meeting created successfully',
            data: created,
        };
    }

    getMeetings() {

        return {
            success: true,
            data: this.meetingModel.findAll(),
        };

    }

    getMeeting(id: string) {

        const meeting =
            this.meetingModel.findById(id);

        if (!meeting)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {
            success: true,
            data: meeting,
        };

    }

    updateMeeting(id: string, body: any) {

        const meeting =
            this.meetingModel.update(id, body);

        if (!meeting)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {
            success: true,
            message: 'Meeting updated',
            data: meeting,
        };

    }

    deleteMeeting(id: string) {

        const deleted =
            this.meetingModel.delete(id);

        if (!deleted)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {
            success: true,
            message: 'Meeting deleted',
        };

    }

    joinMeeting(
        meetingId: string,
        participant: string,
    ) {

        const meeting =
            this.meetingModel.addParticipant(
                meetingId,
                participant,
            );

        if (!meeting)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {

            success: true,

            message: 'Participant joined',

            data: meeting,

        };

    }

    leaveMeeting(
        meetingId: string,
        participant: string,
    ) {

        const meeting =
            this.meetingModel.removeParticipant(
                meetingId,
                participant,
            );

        if (!meeting)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {

            success: true,

            message: 'Participant left',

            data: meeting,

        };

    }

    getParticipants(
        meetingId: string,
    ) {

        const meeting =
            this.meetingModel.findById(meetingId);

        if (!meeting)
            throw new NotFoundException(
                'Meeting not found',
            );

        return {

            success: true,

            data: meeting.participants,

        };

    }

    async generateToken(
        meetingId: string,
        participant: string,
    ) {

        const meeting =
            this.meetingModel.findById(
                meetingId,
            );

        if (!meeting) {

            throw new NotFoundException(
                'Meeting not found',
            );

        }

        const token =
            await this.livekitModel.generateToken(
                meeting.roomName,
                participant,
            );

        return {

            success: true,

            roomName: meeting.roomName,

            token,

        };

    }

    async connectMeeting(
        meetingId: string,
        participant: string,
    ) {

        const meeting =
            this.meetingModel.findById(
                meetingId,
            );

        if (!meeting) {

            throw new NotFoundException(
                'Meeting not found',
            );

        }

        this.meetingModel.addParticipant(
            meetingId,
            participant,
        );

        const token =
            await this.livekitModel.generateToken(
                meeting.roomName,
                participant,
            );

        return {

            success: true,

            meeting,

            token,

            roomName: meeting.roomName,

        };

    }

}