import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingModel {

    private meetings: any[] = [];

    create(meeting: any) {
        this.meetings.push(meeting);
        return meeting;
    }

    findAll() {
        return this.meetings;
    }

    findById(id: string) {
        return this.meetings.find(
            meeting => meeting.meetingId === id,
        );
    }

    update(id: string, data: any) {

        const meeting = this.findById(id);

        if (!meeting) return null;

        Object.assign(meeting, data);

        return meeting;

    }

    delete(id: string) {

        const index = this.meetings.findIndex(
            meeting => meeting.meetingId === id,
        );

        if (index === -1) return false;

        this.meetings.splice(index, 1);

        return true;

    }

    addParticipant(id: string, participant: string) {

        const meeting = this.findById(id);

        if (!meeting) return null;

        if (!meeting.participants.includes(participant)) {

            meeting.participants.push(participant);

            meeting.participantCount =
                meeting.participants.length;

        }

        return meeting;

    }

    removeParticipant(id: string, participant: string) {

        const meeting = this.findById(id);

        if (!meeting) return null;

        meeting.participants =
            meeting.participants.filter(
                (p: string) => p !== participant,
            );

        meeting.participantCount =
            meeting.participants.length;

        return meeting;

    }

}